import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAssetGraph } from '../services/assetApi';
import AssetGraph from '../components/AssetGraph';
import { useTranslation } from '../hooks/useTranslation';
import Navbar from '../components/Navbar';

// Fallback demo graph shown when no documents have been uploaded yet
const DEMO_GRAPH = {
  nodes: [
    { id: 'p1', type: 'person', position: { x: 270, y: 60 },  data: { name: 'Ramesh Kumar', role: 'Deceased — Father' } },
    { id: 'a1', type: 'asset',  position: { x: 60,  y: 220 }, data: { institution: 'SBI', asset_type: 'Savings Account', amount: 245000 } },
    { id: 'a2', type: 'asset',  position: { x: 270, y: 220 }, data: { institution: 'LIC', asset_type: 'Life Insurance Policy', amount: 500000 } },
    { id: 'a3', type: 'asset',  position: { x: 480, y: 220 }, data: { institution: 'HDFC AMC', asset_type: 'Mutual Fund — Equity', amount: 200000 } },
  ],
  edges: [
    { id: 'e1', source: 'p1', target: 'a1', animated: true },
    { id: 'e2', source: 'p1', target: 'a2', animated: true },
    { id: 'e3', source: 'p1', target: 'a3', animated: true },
  ],
};

export default function AssetDiscovery() {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useTranslation();
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [graphResponse, setGraphResponse] = useState(null);
  const [isDemo, setIsDemo]               = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadGraph() {
      try {
        const res = await fetchAssetGraph('demo');
        if (!cancelled) {
          // If backend graph has no nodes, fall back to demo data
          const hasNodes = res?.graph?.nodes?.length > 0;
          if (hasNodes) {
            setGraphResponse(res);
          } else {
            setGraphResponse({
              graph: DEMO_GRAPH,
              summary: { totalAssets: 3, totalValueFormatted: '₹9,45,000' },
              explanation: 'Demo family asset graph showing three discovered assets — an SBI savings account, LIC life policy, and HDFC AMC mutual fund — linked to Ramesh Kumar.',
            });
            setIsDemo(true);
          }
        }
      } catch (err) {
        if (!cancelled) {
          // Network/server error — still show demo so the page is useful
          setGraphResponse({
            graph: DEMO_GRAPH,
            summary: { totalAssets: 3, totalValueFormatted: '₹9,45,000' },
            explanation: 'Demo family asset graph (backend unavailable — showing sample data).',
          });
          setIsDemo(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGraph();
    return () => { cancelled = true; };
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-white font-bold text-lg">Loading Family Asset Graph…</h2>
        <p className="text-sm">Connecting data points across discovered documents</p>
      </div>
    );
  }

  const { graph, summary, explanation } = graphResponse;

  return (
    <div className="min-h-screen bg-[#f3f8fc] bg-grid-dots font-sans antialiased text-slate-700 flex flex-col pb-16 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[140px] -top-32 -left-32 pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[140px] -bottom-32 -right-32 pointer-events-none animate-pulse duration-[10s]" />

      <Navbar
        backTo="/"
        backLabel="← Home"
        subtitle="Family Asset Knowledge Graph"
        rightSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isDemo && (
              <div className="px-2.5 py-1 bg-amber-950/40 border border-amber-600/40 rounded-full text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                Demo Data
              </div>
            )}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-bold text-amber-500 hover:text-amber-400 transition-all cursor-pointer shadow-sm"
            >
              <svg style={{ width: '1rem', height: '1rem', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l7.5-7.5L21 21M16.5 15h3.75M3 5.25h16.5M3.75 3v15m9-15v15" />
              </svg>
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>
          </div>
        }
      />

      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10 w-full flex-1">

        {/* Title + Summary */}
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

        {/* AI Explanation */}
        {explanation && (
          <div className="bg-white/80 backdrop-blur-md border border-amber-500/20 shadow-3d-gold hover-glow-gold rounded-2xl p-5 mb-6 flex gap-3 shadow-sm transition-all duration-300">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5 shadow-sm">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">Varasat AI Summary</div>
              <p className="text-sm text-slate-700 leading-relaxed font-semibold">{explanation}</p>
            </div>
          </div>
        )}

        {/* React Flow Graph */}
        <div className="rounded-2xl overflow-hidden border border-slate-200/80 mb-6 bg-white/90 backdrop-blur-md shadow-3d-gold hover-glow-gold transition-all duration-300 relative z-10">
          <AssetGraph graphData={graph} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/upload"
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm h-11 transition-all shadow-sm"
          >
            + Add Another Document
          </Link>
          <Link
            to="/claim-analysis"
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm h-11 transition-all shadow-md shadow-amber-500/10"
          >
            Analyze Claim Eligibility
          </Link>
        </div>
      </main>
    </div>
  );
}

// ── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value, color }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-4 py-2.5 text-center min-w-[110px] shadow-3d-blue hover-glow-blue transition-all duration-300">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
      <div className="text-base font-black mt-0.5" style={{ color }}>{value}</div>
    </div>
  );
}
