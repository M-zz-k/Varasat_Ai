import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { analyzeFinancialImpact, analyzeWithWolframEngine } from '../services/analyticsApi';
import FinancialImpactCard from '../components/FinancialImpactCard';
import WolframAnalysisCard from '../components/WolframAnalysisCard';

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

const IconLightning = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconDownload = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// ─── Presets ───────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Small · ₹2L, 5 yrs',    amount: 200000,  years: 5,  rate: 0.06 },
  { label: 'Medium · ₹5L, 10 yrs',  amount: 500000,  years: 10, rate: 0.06 },
  { label: 'Large · ₹20L, 15 yrs',  amount: 2000000, years: 15, rate: 0.06 },
];

const INFLATION_OPTIONS = [
  { label: '5% — Low',           value: 0.05 },
  { label: '6% — RBI Average',   value: 0.06 },
  { label: '7% — High',          value: 0.07 },
  { label: '8% — Very High',      value: 0.08 },
];

// ─── Compound data builder (client-side projection for chart) ──────────────────

function buildChartData(principal, years, rate) {
  return Array.from({ length: years + 1 }, (_, yr) => ({
    year: yr,
    value: Math.round(principal * Math.pow(1 + rate, yr)),
    realValue: Math.round(principal * Math.pow(1 + 0.035, yr)), // real 3.5% growth control
  }));
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV(data, principal, years, rate) {
  const rows = [
    ['Year', 'Nominal Value (INR)', 'Real Value (INR)', 'Inflation Loss (INR)'],
    ...data.map(d => [
      d.year,
      d.value,
      d.realValue,
      d.value - d.realValue,
    ]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `varasat_valuation_${principal}_${years}yrs_${(rate * 100).toFixed(0)}pct.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const nominal = payload.find(p => p.dataKey === 'value');
  const real    = payload.find(p => p.dataKey === 'realValue');
  return (
    <div style={{
      background: 'rgba(8,15,30,0.97)',
      border: '1px solid rgba(245,158,11,0.35)',
      borderRadius: '10px',
      padding: '0.75rem 1rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontSize: '0.7rem', color: '#fcd34d', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '0.06em' }}>
        YEAR {label}
      </div>
      {nominal && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 700, marginBottom: '0.2rem' }}>
          <span>Nominal</span>
          <span>₹{nominal.value.toLocaleString('en-IN')}</span>
        </div>
      )}
      {real && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', fontSize: '0.78rem', color: '#93c5fd', fontWeight: 700 }}>
          <span>Real</span>
          <span>₹{real.value.toLocaleString('en-IN')}</span>
        </div>
      )}
      {nominal && real && (
        <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', gap: '1.5rem', fontSize: '0.72rem', color: '#f87171', fontWeight: 700 }}>
          <span>Purchasing loss</span>
          <span>₹{(nominal.value - real.value).toLocaleString('en-IN')}</span>
        </div>
      )}
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        {label}
      </label>
      {children}
      {hint && <span className="text-[10px] text-slate-600 leading-tight">{hint}</span>}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [amount,        setAmount]        = useState('');
  const [years,         setYears]         = useState('');
  const [inflationRate, setInflationRate] = useState(0.06);
  const [loading,       setLoading]       = useState(false);
  const [result,        setResult]        = useState(null);
  const [advancedResult, setAdvancedResult] = useState(null);
  const [activeTab, setActiveTab] = useState('financial');
  const [error,         setError]         = useState('');

  // Build chart data from user inputs (live preview)
  const chartData = useMemo(() => {
    const amt = parseFloat(amount);
    const yrs = parseInt(years, 10);
    if (!amt || !yrs || amt <= 0 || yrs <= 0 || yrs > 100) return [];
    return buildChartData(amt, yrs, inflationRate);
  }, [amount, years, inflationRate]);

  function applyPreset(p) {
    setAmount(String(p.amount));
    setYears(String(p.years));
    setInflationRate(p.rate);
    setResult(null);
    setAdvancedResult(null);
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
    setAdvancedResult(null);

    try {
      // Keep legacy for existing cards
      const data = await analyzeFinancialImpact(amt, yrs, inflationRate);
      setResult(data);
      
      // Call advanced real Wolfram engine
      const advancedData = await analyzeWithWolframEngine(
        [{ type: 'Bank', amount: amt }], 
        yrs,
        inflationRate,
        { nomineeAvailable: true, documentsComplete: true }
      );
      setAdvancedResult(advancedData);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please check backend and Wolfram key.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-300 pb-16 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/4 rounded-full blur-[140px] -bottom-32 -right-32 pointer-events-none" />

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white font-bold text-xs px-2.5 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-800/50 transition-all mr-1"
          >
            <IconArrowLeft /> Home
          </Link>

          <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
            <IconLightning />
          </div>

          <div>
            <h1 className="font-extrabold text-white text-sm leading-none">
              Valuation &amp; Financial Analysis
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
              Powered by Wolfram Language Engine
            </p>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-3xl mx-auto px-6 py-10 relative z-10">

        {/* Intro */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight">Valuation Audit</h2>
          <p className="text-slate-400 text-sm mt-1.5 max-w-lg mx-auto leading-relaxed">
            Estimate compounding loss on dormant family assets and evaluate the return on claims recovery.
          </p>
        </div>

        {/* ── Input Card ── */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl mb-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-1.5">
            <IconChart /> Ingestion Parameters
          </h3>

          {/* Presets */}
          <div className="mb-5">
            <span className="block text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-2">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-amber-500/40 hover:text-amber-400 text-slate-400 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Asset Amount (₹)" hint="e.g. 500000 for ₹5 Lakhs">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 500000"
                min="1"
                className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 outline-none focus:border-amber-500/70 transition-all"
              />
            </Field>

            <Field label="Years Unclaimed" hint="Period since asset became dormant">
              <input
                type="number"
                value={years}
                onChange={e => setYears(e.target.value)}
                placeholder="e.g. 10"
                min="1"
                max="100"
                className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 outline-none focus:border-amber-500/70 transition-all"
              />
            </Field>

            <Field label="Inflation Rate" hint="RBI long-term average is ~6%">
              <select
                value={inflationRate}
                onChange={e => setInflationRate(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 outline-none focus:border-amber-500/70 transition-all cursor-pointer"
              >
                {INFLATION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-slate-950">{o.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <IconAlert />
                {error}
              </span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-200 cursor-pointer">
                <IconClose />
              </button>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm h-11 tracking-wide transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(245,158,11,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Wolfram engine calculating…
              </>
            ) : (
              <>
                <IconLightning />
                Compute with Wolfram Language
              </>
            )}
          </button>
        </div>

        {/* ── Live Projection Chart ── */}
        {chartData.length > 1 && (
          <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl mb-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  Compounding Projection
                </h3>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Nominal growth vs real purchasing power over {years} years
                </p>
              </div>
              <button
                onClick={() => exportCSV(chartData, amount, years, inflationRate)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
              >
                <IconDownload />
                Export CSV
              </button>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradNominal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

                <XAxis
                  dataKey="year"
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `Yr ${v}`}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                  width={68}
                  tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`}
                />

                <Tooltip content={<ChartTooltip />} />

                {/* Reference line at year 0 value */}
                <ReferenceLine
                  y={parseFloat(amount)}
                  stroke="rgba(255,255,255,0.12)"
                  strokeDasharray="4 4"
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  name="Nominal"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#gradNominal)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="realValue"
                  name="Real"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#gradReal)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex gap-5 justify-center mt-3">
              <LegendDot color="#f59e0b" label="Nominal value (inflated)" />
              <LegendDot color="#3b82f6" label="Real purchasing power" />
            </div>
          </div>
        )}

        {/* ── Core Financial Intelligence Engine (Wolfram) ── */}
        {advancedResult && advancedResult.success && advancedResult.data && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconLightning />
                <h2 className="text-xl font-black text-amber-500 tracking-tight">Computational Intelligence Engine</h2>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border border-slate-800 px-2.5 py-1 rounded-full">
                Computed using Wolfram Language
              </span>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 border-b border-slate-800/80 pb-3 mb-6 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('financial')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'financial' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Financial Intelligence
              </button>
              <button 
                onClick={() => setActiveTab('simulation')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'simulation' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Scenario Simulation
              </button>
              <button 
                onClick={() => setActiveTab('portfolio')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'portfolio' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Asset Portfolio
              </button>
              <button 
                onClick={() => setActiveTab('readiness')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'readiness' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Recovery Readiness
              </button>
            </div>

            {/* 1. Financial Intelligence */}
            {activeTab === 'financial' && (
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-xl animate-fade-in">
                <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4">
                  1. Advanced Financial Modelling
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Future Value (Nominal)</span>
                    <span className="text-lg font-black text-emerald-400 mt-1 block">₹{advancedResult.data.financialModel.result?.futureValue?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="bg-red-950/20 p-4 rounded-xl border border-red-800/30">
                    <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider block">Purchasing Power Loss</span>
                    <span className="text-lg font-black text-red-400 mt-1 block">-₹{advancedResult.data.financialModel.result?.inflationImpact?.toLocaleString('en-IN') || 0}</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Cost of Delayed Recovery</span>
                  <div className="text-lg font-black text-amber-400">₹{advancedResult.data.financialModel.result?.delayedRecoveryCost?.toLocaleString('en-IN') || 0}</div>
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed font-mono bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-amber-500">Wolfram Math:</span> {advancedResult.data.financialModel.calculation}
                  <br/><span className="text-slate-500 mt-1 block">{advancedResult.data.financialModel.explanation}</span>
                </p>
              </div>
            )}

            {/* 2. Scenario Simulation */}
            {activeTab === 'simulation' && (
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-xl animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    2. Recovery Scenario Simulation
                  </h3>
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded font-bold">
                    Simulation based on provided assumptions
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/30 text-center">
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Fast Recovery</span>
                    <span className="text-xl font-black text-white">{advancedResult.data.recoverySimulation.result?.fastScenario?.days || 0}</span>
                    <span className="text-[10px] text-slate-500 font-bold ml-1">days</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/30 text-center">
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block mb-1">Normal Recovery</span>
                    <span className="text-xl font-black text-white">{advancedResult.data.recoverySimulation.result?.normalScenario?.days || 0}</span>
                    <span className="text-[10px] text-slate-500 font-bold ml-1">days</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/30 text-center">
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block mb-1">Delayed Recovery</span>
                    <span className="text-xl font-black text-white">{advancedResult.data.recoverySimulation.result?.delayedScenario?.days || 0}</span>
                    <span className="text-[10px] text-slate-500 font-bold ml-1">days</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed font-mono bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-amber-500">Wolfram Method:</span> {advancedResult.data.recoverySimulation.method}
                  <br/><span className="text-slate-500 mt-1 block">{advancedResult.data.recoverySimulation.explanation}</span>
                </p>
              </div>
            )}

            {/* 3. Asset Portfolio */}
            {activeTab === 'portfolio' && (
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-xl animate-fade-in">
                <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4">
                  3. Asset Portfolio Distribution
                </h3>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Value</span>
                    <span className="text-lg font-black text-white">₹{advancedResult.data.portfolioAnalysis.result?.totalAssets?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  {advancedResult.data.portfolioAnalysis.result?.distribution?.map((item, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">{item.type}</span>
                        <span className="text-slate-400">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed font-mono bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-amber-500">Calculation:</span> {advancedResult.data.portfolioAnalysis.calculation}
                </p>
              </div>
            )}

            {/* 4. Recovery Readiness */}
            {activeTab === 'readiness' && (
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-xl animate-fade-in">
                <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4">
                  4. Document Completeness Analysis
                </h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center flex-col shrink-0">
                    <span className="text-2xl font-black text-white">{advancedResult.data.documentReadiness.result?.readinessScore || 0}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Score</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200 leading-relaxed mb-2">
                      {advancedResult.data.documentReadiness.result?.recommendation}
                    </p>
                    {advancedResult.data.documentReadiness.result?.missingItems?.length > 0 && (
                      <div className="text-xs text-red-400 font-semibold">
                        Missing: {advancedResult.data.documentReadiness.result.missingItems.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4 border-t border-slate-800/80 pt-4">
                  Asset Priority Ranking
                </h3>
                <div className="space-y-3">
                  {advancedResult.data.priorityOptimization.result?.ranking?.map((r, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div>
                        <div className="text-sm font-bold text-slate-200">{r.type}</div>
                        <div className="text-[10px] text-slate-500">{r.reason}</div>
                      </div>
                      <div className="text-amber-500 font-mono text-sm">Score: {r.score}</div>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-slate-400 mt-4 leading-relaxed font-mono bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-amber-500">Wolfram Method:</span> {advancedResult.data.priorityOptimization.method}
                  <br/><span className="text-slate-500 mt-1 block">{advancedResult.data.documentReadiness.explanation}</span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                to="/chat"
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs h-11 tracking-wide transition-all duration-200 hover:scale-[1.01]"
              >
                Ask Varasat Mitra
              </Link>
              <Link
                to="/analyze"
                className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-800 bg-transparent hover:bg-slate-800/40 text-slate-300 font-semibold text-xs h-11 transition-all duration-200"
              >
                Ingest New Documents
              </Link>
            </div>
          </div>
        )}

        {/* ── Empty state instructions ── */}
        {!result && (
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4">
              Calculation Procedure
            </h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Asset Parameters',  text: 'Define the total asset valuation sum and dormancy delay period.' },
                { step: '2', title: 'Wolfram Execution', text: 'Compound interest and inflation curves are computed via native Wolfram Language queries.' },
                { step: '3', title: 'AI Synthesis',      text: 'Claude evaluates the resulting calculations and explains the legal context to heirs.' },
                { step: '4', title: 'Loss Mapping',      text: 'Review visual metrics showing inflation degradation and recovery returns.' },
              ].map(item => (
                <div key={item.step} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-slate-950 text-amber-500 border border-amber-500/20 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <span className="text-white text-xs font-bold block">{item.title}</span>
                    <span className="text-slate-500 text-xs mt-0.5 block leading-relaxed">{item.text}</span>
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

// ─── Micro-components ──────────────────────────────────────────────────────────

function MetaStat({ label, value }) {
  return (
    <div>
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
        {label}
      </span>
      <span className="text-sm font-extrabold text-white mt-1 block">{value}</span>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{label}</span>
    </div>
  );
}
