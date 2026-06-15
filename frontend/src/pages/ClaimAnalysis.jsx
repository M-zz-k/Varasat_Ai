import { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ClaimAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();

  // useRef to hold stable initial data — avoids useEffect re-running on every render
  const initialAssetData = useRef(
    location.state?.assetData || {
      amount: 500000,
      nomineeExists: true,
      documentCount: 3,
      assetType: 'Bank Account',
    }
  ).current;

  const [loading, setLoading] = useState(true);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;

    async function analyzeClaim() {
      try {
        const res = await axios.post('/api/claim/analyze', {
          assetData: initialAssetData,
          userDetails: {},
        });
        if (!cancelled) setResult(res.data);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.error || err.message || 'Failed to analyze claim.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    analyzeClaim();
    return () => { cancelled = true; };
  }, []); // ← stable ref, safe empty dep array

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-slate-800 font-extrabold text-lg">Analyzing claim eligibility…</h2>
        <p className="text-sm">Using Wolfram Language for mathematical risk scoring</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-slate-800 font-bold text-lg">Analysis Failed</h2>
        <p className="text-red-500 text-sm max-w-sm">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 bg-white shadow-sm text-sm font-semibold transition-all cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { analysis, recommendation, requiredDocuments } = result;

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f3f8fc] bg-grid-dots font-sans antialiased text-slate-700 pb-16 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[140px] -top-32 -left-32 pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[140px] -bottom-32 -right-32 pointer-events-none animate-pulse duration-[10s]" />

      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-3.5 bg-[#0b1329] border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-200 hover:text-white font-bold text-xs px-2.5 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800/80 transition-all cursor-pointer shadow-sm bg-slate-900/60"
        >
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back
        </button>
        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-sm">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L3 7v5c0 5 4 9.3 9 10.7C17 20.3 21 16 21 12V7z" />
          </svg>
        </div>
        <div>
          <div className="font-extrabold text-white text-sm leading-none">Claim Intelligence</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">Powered by Wolfram &amp; Claude</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 relative z-10">
        <h1 className="text-2xl font-black text-slate-900 text-center mb-8 tracking-tight">
          Claim Eligibility Assessment
        </h1>

        {/* Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <ScoreCard
            label="Eligibility Score"
            value={`${analysis.eligibilityScore}`}
            unit="/100"
            color="#047857"
            borderColor="#10b981"
          />
          <ScoreCard
            label="Risk & Complexity"
            value={analysis.complexity}
            sub={`Wolfram Risk: ${analysis.riskScore}`}
            color={analysis.complexity === 'High' ? '#b91c1c' : '#b45309'}
            borderColor={analysis.complexity === 'High' ? '#ef4444' : '#f59e0b'}
          />
          <ScoreCard
            label="Estimated Time"
            value={String(analysis.estimatedDays)}
            unit=" days"
            color="#1d4ed8"
            borderColor="#3b82f6"
          />
        </div>

        {/* AI Recommendation */}
        <div className="bg-white/80 backdrop-blur-md border border-amber-500/20 shadow-3d-gold hover-glow-gold rounded-2xl p-5 mb-5 transition-all duration-300 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100/60 border border-amber-250 flex items-center justify-center text-amber-700">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-sm font-extrabold text-amber-700">AI Legal Recommendation</h2>
          </div>
          <p className="text-slate-800 text-sm leading-relaxed font-semibold">{recommendation}</p>
        </div>

        {/* Required Documents */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-3d-blue hover-glow-blue rounded-2xl p-5 mb-6 transition-all duration-300 relative z-10">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            Required Documents
          </h2>
          <ul className="space-y-2">
            {requiredDocuments.map((doc, i) => (
              <li
                key={i}
                className="flex items-center gap-3 py-2.5 px-3 bg-slate-50/50 rounded-xl border border-slate-100"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm text-slate-800 font-semibold">{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <Link
            to="/chat"
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm h-11 transition-all shadow-sm"
          >
            Talk to Varasat Mitra
          </Link>
          <Link
            to="/generate-document"
            state={{ assetData: initialAssetData }}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm h-11 transition-all shadow-md shadow-amber-500/10"
          >
            Generate Legal Documents
          </Link>
        </div>
      </main>
    </div>
  );
}

// ── Mini score card ────────────────────────────────────────────────────────────

function ScoreCard({ label, value, unit = '', sub, color, borderColor }) {
  return (
    <div
      className="bg-white/80 backdrop-blur-md rounded-2xl p-5 text-center border border-slate-200/80 shadow-3d-blue hover-glow-blue transition-all duration-300 hover:scale-[1.03] border-t-4"
      style={{ borderTopColor: borderColor }}
    >
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{label}</div>
      <div className="font-black text-2xl" style={{ color }}>
        {value}
        {unit && <span className="text-sm font-normal text-slate-500">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1 font-semibold">{sub}</div>}
    </div>
  );
}
