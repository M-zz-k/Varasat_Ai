import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAssetGraph } from '../services/assetApi';
import AssetGraph from '../components/AssetGraph';
import { useTranslation } from '../hooks/useTranslation';

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
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white font-bold text-xs px-2.5 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-800/50 transition-all mr-1"
          >
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Home
          </Link>

          <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10A15.3 15.3 0 0 1 8 12 15.3 15.3 0 0 1 12 2z" />
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-white text-sm leading-none">Asset Map</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">Knowledge Graph Visualization</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDemo && (
            <div className="px-2.5 py-1 bg-amber-900/20 border border-amber-700/30 rounded-full text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              Demo Data
            </div>
          )}

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-amber-500 hover:text-amber-400 transition-all cursor-pointer"
          >
            <svg style={{ width: '1rem', height: '1rem', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l7.5-7.5L21 21M16.5 15h3.75M3 5.25h16.5M3.75 3v15m9-15v15" />
            </svg>
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Title + Summary */}
        <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Family Asset Map</h1>
            <p className="text-slate-400 text-sm mt-1">Visualizing discovered financial relationships.</p>
          </div>

          <div className="flex gap-3">
            <StatPill label="Total Value" value={summary?.totalValueFormatted || '₹0'} color="#10b981" />
            <StatPill label="Assets" value={String(summary?.totalAssets || 0)} color="#3b82f6" />
          </div>
        </div>

        {/* AI Explanation */}
        {explanation && (
          <div className="bg-blue-950/20 border border-blue-700/25 rounded-2xl p-4 mb-5 flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-900/30 border border-blue-700/30 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Varasat AI Summary</div>
              <p className="text-sm text-slate-200 leading-relaxed">{explanation}</p>
            </div>
          </div>
        )}

        {/* React Flow Graph */}
        <div className="rounded-2xl overflow-hidden border border-slate-800/60 mb-6">
          <AssetGraph graphData={graph} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/upload"
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-transparent hover:bg-slate-800/50 text-slate-200 font-bold text-sm h-11 transition-all"
          >
            + Add Another Document
          </Link>
          <Link
            to="/claim-analysis"
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm h-11 transition-all"
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
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
      <div className="text-base font-black mt-0.5" style={{ color }}>{value}</div>
    </div>
  );
}
