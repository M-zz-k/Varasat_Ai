import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { explainAssetMap } from '../services/assetApi';
import AssetGraph from '../components/AssetGraph';
import { useTranslation } from '../hooks/useTranslation';
import Navbar from '../components/Navbar';
import JourneyHeader from '../components/JourneyHeader';
import { useGraphQuery, useExplainMapMutation, useFinalEnhancementQuery } from '../hooks/useClaimQueries';

// Fallback demo graph shown when no documents have been uploaded yet
const DEMO_GRAPH = {
  nodes: [
    { id: 'p1', type: 'person', position: { x: 270, y: 60 }, data: { name: 'Ramesh Kumar', role: 'Deceased — Father' } },
    { id: 'a1', type: 'asset', position: { x: 60, y: 220 }, data: { institution: 'SBI', asset_type: 'Savings Account', amount: 245000 } },
    { id: 'a2', type: 'asset', position: { x: 270, y: 220 }, data: { institution: 'LIC', asset_type: 'Life Insurance Policy', amount: 500000 } },
    { id: 'a3', type: 'asset', position: { x: 480, y: 220 }, data: { institution: 'HDFC AMC', asset_type: 'Mutual Fund — Equity', amount: 200000 } },
  ],
  edges: [
    { id: 'e1', source: 'p1', target: 'a1', animated: true },
    { id: 'e2', source: 'p1', target: 'a2', animated: true },
    { id: 'e3', source: 'p1', target: 'a3', animated: true },
  ],
};

export default function AssetDiscovery() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useTranslation();
  
  const { data: graphResponse, isLoading: loading, refetch: refetchGraph } = useGraphQuery(familyId, lang);
  const { data: finalEnhancementData } = useFinalEnhancementQuery(familyId);
  const explainMutation = useExplainMapMutation();
  
  const [interactiveExplanation, setInteractiveExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const handleExplainClick = async (forceLang) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlayingAudio(false);

    const targetGraph = graphResponse?.graph || DEMO_GRAPH;
    if (!targetGraph) return;
    setIsExplaining(true);
    setInteractiveExplanation('VARASAT AI is preparing your explanation...');
    try {
      const activeLang = typeof forceLang === 'string' ? forceLang : lang;
      const languageText = activeLang === 'hi' ? 'hi' : 'en';
      const result = await explainAssetMap(targetGraph, languageText);
      setInteractiveExplanation(result.explanation || 'Unable to generate explanation. Please try again.');
    } catch (err) {
      console.error(err);
      setInteractiveExplanation('Unable to generate explanation. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    if (lang === newLang) return;
    toggleLanguage(newLang);
    if (interactiveExplanation && !interactiveExplanation.includes('Unable to')) {
      handleExplainClick(newLang);
    }
  };

  const handleToggleVoice = async () => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!interactiveExplanation) return;
    
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      setInteractiveExplanation(prev => prev + '\n\n[Voice unavailable in this browser. Please try again later.]');
      return;
    }

    try {
      window.speechSynthesis.cancel(); // clear queue
      
      const playUtterance = () => {
        const utterance = new SpeechSynthesisUtterance(interactiveExplanation);
        const isHindi = lang === 'hi';
        utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
        
        const voices = window.speechSynthesis.getVoices();
        console.log('Selected language:', isHindi ? 'Hindi' : 'English');
        console.log('Available voices:', voices.map(v => `${v.lang} (${v.name})`));
        
        let targetVoice = null;
        if (voices.length > 0) {
          if (isHindi) {
            targetVoice = voices.find(v => v.lang === "hi-IN" || v.lang.startsWith("hi"));
          } else {
            targetVoice = voices.find(v => v.lang.startsWith("en-IN")) || voices.find(v => v.lang.startsWith("en"));
          }
          if (targetVoice) {
            utterance.voice = targetVoice;
          }
        }
        
        console.log('Selected voice:', targetVoice ? targetVoice.name : 'Fallback browser default');
        
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = (e) => {
          console.error('SpeechSynthesis error:', e);
          setIsPlayingAudio(false);
          setInteractiveExplanation(prev => prev + '\n\nVoice unavailable. Please try again.');
        };
        
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          playUtterance();
          window.speechSynthesis.onvoiceschanged = null; // Clean up
        };
      } else {
        playUtterance();
      }
      
    } catch (err) {
      console.error(err);
      setIsPlayingAudio(false);
      setInteractiveExplanation(prev => prev + '\n\nVoice unavailable. Please try again.');
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-white font-bold text-lg">Loading Family Asset Graph…</h2>
      </div>
    );
  }

  const formatINR = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const graph = graphResponse?.graph || DEMO_GRAPH;
  const assetNodes = graph?.nodes?.filter(n => n.type === 'asset') || [];
  const summary = {
    totalAssets: assetNodes.length,
    totalValueFormatted: formatINR(assetNodes.reduce((sum, node) => sum + (Number(node.data?.amount) || 0), 0))
  };

  return (
    <div className="min-h-screen bg-[#f3f8fc] font-sans antialiased text-slate-700 flex flex-col pb-16">
      <Navbar backTo={familyId ? `/claim/${familyId}` : "/upload"} backLabel="← Back" subtitle="Family Asset Knowledge Graph" />
      <JourneyHeader currentStep={3} />

      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10 w-full flex-1">
        <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Family Asset Map</h1>
            <p className="text-slate-500 text-sm mt-1">Visualizing discovered financial relationships.</p>
          </div>
          <div className="flex gap-3">
            <StatPill label="Total Value" value={summary?.totalValueFormatted || '₹0'} color="#047857" />
            <StatPill label="Assets" value={String(summary?.totalAssets || 0)} color="#1d4ed8" />
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200/80 mb-6 bg-white/90 shadow-sm">
          <AssetGraph graphData={graph} />
        </div>

        <div className="mb-8">
          {!interactiveExplanation && !isExplaining ? (
            <div className="bg-white/90 border border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="text-slate-700 font-black text-lg">Understand Your Map</div>
              </div>
              <button 
                onClick={() => handleExplainClick()}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold rounded-xl transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                Explain This Map (Voice & Text)
              </button>
            </div>
          ) : isExplaining ? (
            <div className="w-full flex items-center justify-center gap-3 py-3.5 bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold rounded-xl">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            <div className="bg-white/90 border border-indigo-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2 text-indigo-700 font-black">AI Explanation</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button 
                      onClick={() => handleLanguageChange('en')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'en' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >English</button>
                    <button 
                      onClick={() => handleLanguageChange('hi')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'hi' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >हिंदी</button>
                  </div>
                  <button onClick={handleToggleVoice} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold transition-all shadow-sm">
                    {isPlayingAudio ? 'Playing...' : 'Play Voice'}
                  </button>
                </div>
              </div>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{interactiveExplanation}</div>
            </div>
          )}
        </div>

        {finalEnhancementData?.reasoning && (
          <div className="mb-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              AI + Wolfram Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Asset Discovery Confidence</div>
                    <div className="text-2xl font-black text-slate-800">{finalEnhancementData.reasoning.assetDiscoveryConfidence}%</div>
                  </div>
                  
                  <div className="space-y-1 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Identity Match:</span>
                      <span className="text-slate-800">{finalEnhancementData.reasoning.breakdown?.identityMatch}%</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Family Link:</span>
                      <span className="text-slate-800">{finalEnhancementData.reasoning.breakdown?.familyLink}%</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Document Completeness:</span>
                      <span className="text-slate-800">{finalEnhancementData.reasoning.breakdown?.documentCompleteness}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-slate-600">
                    {finalEnhancementData.reasoning.factors?.map((f, i) => <div key={i} className="mb-0.5">{f.startsWith('-') ? f : `✓ ${f}`}</div>)}
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Timeline Consistency</div>
                    <div className="text-2xl font-black text-slate-800">{finalEnhancementData.reasoning.timelineConsistencyScore}%</div>
                  </div>
                  
                  <div className="flex-1 mt-3 relative pl-2 border-l border-slate-200 ml-1">
                    {finalEnhancementData.reasoning.timeline?.map((t, idx) => (
                      <div key={idx} className="mb-2.5 relative">
                        <div className="absolute -left-3.5 top-1 w-2.5 h-2.5 rounded-full bg-slate-200 border border-white"></div>
                        <div className="text-[10px] font-bold text-slate-700 leading-none">{t.year}</div>
                        <div className="text-xs text-slate-500 leading-tight mt-0.5">{t.event}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-[10px] text-amber-700/80 italic font-bold">
              {finalEnhancementData.reasoning.safetyDisclaimer || "AI-assisted confidence estimate. Does not establish legal ownership."}
            </div>
          </div>
        )}

        {finalEnhancementData?.guidance && (
          <div className="mb-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Your Recommended Next Steps
            </h3>
            
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {finalEnhancementData.guidance.steps?.map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm mb-1">{step.title}</div>
                      <div className="text-xs text-slate-600 leading-relaxed">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">You may need:</div>
                  <div className="space-y-1.5">
                    {finalEnhancementData.guidance.requiredDocs?.map((doc, i) => (
                      <div key={i} className="text-xs text-slate-700 font-medium">{doc}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Authority:</div>
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    {finalEnhancementData.guidance.authority}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-[10px] text-amber-700/80 italic font-bold">
              {finalEnhancementData.guidance.safetyDisclaimer}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/upload" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">Add More Documents</Link>
          <Link to="/generate-document" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all">Start Claim Process</Link>
        </div>
      </main>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-4 py-2.5 text-center min-w-[110px] shadow-3d-blue hover-glow-blue transition-all duration-300">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
      <div className="text-base font-black mt-0.5" style={{ color }}>{value}</div>
    </div>
  );
}
