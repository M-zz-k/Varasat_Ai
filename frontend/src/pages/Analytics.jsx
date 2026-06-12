import { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeFinancialImpact } from '../services/analyticsApi';
import FinancialImpactCard from '../components/FinancialImpactCard';

// ─── Preset examples ──────────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Small (₹2L, 5 yrs)',   amount: 200000,  years: 5,  rate: 0.06 },
  { label: 'Medium (₹5L, 10 yrs)', amount: 500000,  years: 10, rate: 0.06 },
  { label: 'Large (₹20L, 15 yrs)', amount: 2000000, years: 15, rate: 0.06 },
];

const INFLATION_OPTIONS = [
  { label: '5% (Low)',          value: 0.05 },
  { label: '6% (RBI Average)',  value: 0.06 },
  { label: '7% (High)',         value: 0.07 },
  { label: '8% (Very High)',    value: 0.08 },
];

// ─── Input field helper ───────────────────────────────────────────────────────

function Field({ label, icon, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
        <span>{icon}</span>
        <span>{label}</span>
      </label>
      {children}
      {hint && <span className="text-[10px] text-slate-500 leading-tight">{hint}</span>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [amount,       setAmount]       = useState('');
  const [years,        setYears]        = useState('');
  const [inflationRate,setInflationRate]= useState(0.06);
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState('');

  function applyPreset(p) {
    setAmount(String(p.amount));
    setYears(String(p.years));
    setInflationRate(p.rate);
    setResult(null);
    setError('');
  }

  async function handleAnalyze() {
    const amt = parseFloat(amount);
    const yrs = parseFloat(years);

    if (!amt || amt <= 0) { setError('Please enter a valid asset amount.'); return; }
    if (!yrs || yrs <= 0 || yrs > 100) { setError('Please enter years between 1 and 100.'); return; }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeFinancialImpact(amt, yrs, inflationRate);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please check backend and Wolfram key.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-300 pb-16 relative overflow-hidden">
      
      {/* Background Lighting Orbs */}
      <div className="absolute w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="text-slate-400 hover:text-white font-bold text-xs px-2.5 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-850/50 transition-all mr-2"
          >
            ← Home
          </Link>
          
          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-lg">
            ⚡
          </div>

          <div>
            <h1 className="font-extrabold text-white text-sm leading-none">Valuation & Financial Analysis</h1>
            <p className="text-[10px] text-slate-500 mt-1 font-bold">Powered by Wolfram Language Engine</p>
          </div>
        </div>
      </header>

      {/* Main Main Container */}
      <main className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        
        {/* Intro */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Valuation Audit
          </h2>
          <p className="text-slate-400 text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
            Estimate compounding loss on dormant family assets and evaluate the return on claims recovery.
          </p>
        </div>

        {/* Form Input Card */}
        <div className="bg-slate-900/60 border border-slate-850/80 backdrop-blur-md p-6 rounded-2xl shadow-xl mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <span>📊</span> Ingestion Details
          </h3>

          {/* Quick Presets */}
          <div className="mb-6">
            <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2.5">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button 
                  key={p.label} 
                  onClick={() => applyPreset(p)} 
                  className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:border-amber-500/30 text-amber-500 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <Field label="Asset Amount (₹)" icon="💰" hint="e.g. 500000 for ₹5 Lakhs">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 500000"
                min="1"
                className="w-full bg-slate-950 border border-slate-850 text-white placeholder-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 transition-all"
              />
            </Field>

            <Field label="Years Unclaimed" icon="⏳" hint="Period since asset became dormant">
              <input
                type="number"
                value={years}
                onChange={e => setYears(e.target.value)}
                placeholder="e.g. 10"
                min="1"
                max="100"
                className="w-full bg-slate-950 border border-slate-850 text-white placeholder-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 transition-all"
              />
            </Field>

            <Field label="Inflation Rate" icon="📈" hint="RBI long-term average is ~6%">
              <select
                value={inflationRate}
                onChange={e => setInflationRate(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 text-white text-sm font-semibold rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 transition-all cursor-pointer"
              >
                {INFLATION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-slate-950">{o.label}</option>
                ))}
              </select>
            </Field>

          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-red-400 text-xs font-semibold flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-300 font-bold text-sm">✕</button>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Wolfram engine calculating...
              </span>
            ) : (
              '⚡ Compute with Wolfram Language'
            )}
          </button>
        </div>

        {/* Interactive Math Valuation Graph Node */}
        {result && result.success && (
          <div className="bg-slate-900/60 border border-slate-850/80 backdrop-blur-md p-6 rounded-2xl shadow-xl mb-6">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6">
              Compounding Audit Ledger
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Initial value</span>
                <span className="text-xs font-extrabold text-white mt-1 block">{result.original_amount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Dormancy Period</span>
                <span className="text-xs font-extrabold text-white mt-1 block">{result.years_delayed} years</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Inflation Coefficient</span>
                <span className="text-xs font-extrabold text-white mt-1 block">{result.inflation_rate}</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider leading-none">Wolfram Valuation Method</span>
                <span className="font-mono text-white text-base font-bold block mt-1.5">FV = P * (1 + r)^t</span>
              </div>
              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Compounded Engine Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Compounded Value (FV)</span>
                <span className="text-base font-black text-emerald-400 mt-1 block">{result.analysis.futureValue}</span>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider block">Purchasing Power Loss</span>
                <span className="text-base font-black text-red-400 mt-1 block">-{result.analysis.purchasingPowerLoss}</span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Impact Graphics Card */}
        {result && result.success && (
          <div className="space-y-6">
            <FinancialImpactCard data={result} />

            {/* Navigation CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                to="/chat" 
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
              >
                💬 Ask Varasat Mitra
              </Link>
              <Link 
                to="/analyze" 
                className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-800 bg-transparent hover:bg-slate-900/50 text-slate-300 font-semibold text-xs h-11 transition-all duration-200"
              >
                🔍 Ingest New Documents
              </Link>
            </div>
          </div>
        )}

        {/* Setup Information */}
        {!result && (
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">
              Calculation Procedure
            </h3>
            <div className="space-y-4">
              {[
                { step: '1', icon: '📝', title: 'Asset Parameters', text: 'Define the total asset valuation sum and dormancy delay period.' },
                { step: '2', icon: '🔢', title: 'Wolfram Execution', text: 'Compound interest and inflation curves are computed via native Wolfram Language queries.' },
                { step: '3', icon: '⚖️', title: 'AI Synthesis', text: 'Claude evaluates the resulting calculations and explains the legal context to heirs.' },
                { step: '4', icon: '📊', title: 'Loss Mapping', text: 'Review visual metrics showing inflation degradation and recovery returns.' },
              ].map(item => (
                <div key={item.step} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-slate-950 text-amber-500 border border-amber-500/20 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <span className="text-white text-xs font-bold block">{item.icon} {item.title}</span>
                    <span className="text-slate-400 text-xs mt-0.5 block leading-relaxed">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
