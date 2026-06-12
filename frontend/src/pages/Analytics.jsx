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

// ─── Input field ──────────────────────────────────────────────────────────────

function Field({ label, icon, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{
        fontSize: '0.85rem', fontWeight: 700, color: '#a0b8d0',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>
        {icon} {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: '0.72rem', color: '#5a7a9a' }}>{hint}</span>}
    </div>
  );
}

const inputStyle = {
  padding:      '0.85rem 1rem',
  background:   'rgba(22,42,78,0.6)',
  border:       '1px solid rgba(212,160,23,0.2)',
  borderRadius: '10px',
  color:        '#e8f0ff',
  fontSize:     '1rem',
  outline:      'none',
  width:        '100%',
  fontFamily:   "'Inter', sans-serif",
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [amount,       setAmount]       = useState('');
  const [years,        setYears]        = useState('');
  const [inflationRate,setInflationRate]= useState(0.06);
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState('');

  // ── Apply preset ──────────────────────────────────────────────────────────
  function applyPreset(p) {
    setAmount(String(p.amount));
    setYears(String(p.years));
    setInflationRate(p.rate);
    setResult(null);
    setError('');
  }

  // ── Run analysis ──────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:  '100vh',
      background: 'linear-gradient(160deg, #080f1e 0%, #0d1a30 50%, #0f1f3d 100%)',
      fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif",
    }}>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input:focus, select:focus { border-color: rgba(212,160,23,0.6) !important; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '1rem',
        padding:        '1rem 2rem',
        background:     'rgba(8,15,30,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom:   '1px solid rgba(212,160,23,0.15)',
        position:       'sticky', top: 0, zIndex: 50,
      }}>
        <Link to="/" style={{ color: '#8fa4c8', textDecoration: 'none',
          fontSize: '0.95rem', fontWeight: 600 }}>← Home</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f4ff' }}>Financial Impact Analysis</div>
            <div style={{ fontSize: '0.72rem', color: '#8fa4c8' }}>Powered by Wolfram Language</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '740px', margin: '0 auto', padding: '2rem 1.25rem 3rem' }}>

        {/* ── Page intro ── */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeInUp 0.4s ease' }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800,
            color: '#f0f4ff', lineHeight: 1.2, marginBottom: '0.6rem',
          }}>
            Wolfram Financial Valuation
          </h3>
          <p style={{ color: '#8fa4c8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Varasat uses mathematical analysis via Wolfram Language to estimate the financial impact of delayed claims.
          </p>
        </div>

        {/* ── Calculator card ── */}
        <div style={{
          background:   'rgba(15,28,55,0.8)',
          border:       '1px solid rgba(212,160,23,0.18)',
          borderRadius: '20px',
          padding:      '1.75rem',
          marginBottom: '1.5rem',
          animation:    'fadeInUp 0.4s ease 0.1s both',
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#d4a017',
            marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Enter Asset Details
          </div>

          {/* Quick presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#6a8aaa', fontWeight: 600,
              letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Quick Examples
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)} style={{
                  padding:      '0.4rem 0.85rem',
                  background:   'rgba(22,42,78,0.6)',
                  border:       '1px solid rgba(212,160,23,0.2)',
                  borderRadius: '8px',
                  color:        '#d4a017',
                  fontSize:     '0.82rem',
                  cursor:       'pointer',
                  fontWeight:   600,
                  transition:   'all 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,160,23,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(22,42,78,0.6)'}
                >{p.label}</button>
              ))}
            </div>
          </div>

          {/* Input fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>

            <Field label="Asset Amount (₹)" icon="💰" hint="e.g. 500000 for ₹5,00,000">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 500000"
                min="1"
                style={inputStyle}
              />
            </Field>

            <Field label="Years Unclaimed" icon="⏳" hint="How long since the family member passed">
              <input
                type="number"
                value={years}
                onChange={e => setYears(e.target.value)}
                placeholder="e.g. 10"
                min="1"
                max="100"
                style={inputStyle}
              />
            </Field>

            <Field label="Inflation Rate" icon="📈" hint="RBI average is ~6% per year">
              <select
                value={inflationRate}
                onChange={e => setInflationRate(parseFloat(e.target.value))}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {INFLATION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem', borderRadius: '10px',
              background: 'rgba(220,50,50,0.12)', border: '1px solid rgba(220,50,50,0.3)',
              color: '#fca5a5', fontSize: '0.88rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
            }}>
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')} style={{
                background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer',
              }}>✕</button>
            </div>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              width:        '100%',
              marginTop:    '1.25rem',
              padding:      '1rem',
              background:   loading
                ? 'rgba(212,160,23,0.3)'
                : 'linear-gradient(135deg, #d4a017, #b8860b)',
              border:       'none',
              borderRadius: '12px',
              color:        loading ? '#7a6030' : '#0f1f3d',
              fontWeight:   800,
              fontSize:     '1rem',
              cursor:       loading ? 'not-allowed' : 'pointer',
              display:      'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              boxShadow:    loading ? 'none' : '0 4px 16px rgba(212,160,23,0.35)',
              transition:   'all 0.15s',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '16px', height: '16px',
                  border: '2px solid #7a6030', borderTopColor: 'transparent',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }} />
                Wolfram is computing…
              </>
            ) : (
              '⚡ Calculate with Wolfram'
            )}
          </button>

          {loading && (
            <div style={{ textAlign: 'center', marginTop: '0.6rem',
              fontSize: '0.8rem', color: '#6a8aaa', animation: 'fadeInUp 0.3s ease' }}>
              Wolfram Alpha API → Claude AI explanation → Results ready
            </div>
          )}
        </div>

        {/* ── Judge Explicit Calculation Journey ── */}
        {result && result.success && (
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            animation: 'fadeInUp 0.4s ease'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
              Calculation Journey
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#8fa4c8' }}>Input: Asset Amount</div>
                <div style={{ fontWeight: 700, color: '#f0f4ff' }}>{result.original_amount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#8fa4c8' }}>Delay Period</div>
                <div style={{ fontWeight: 700, color: '#f0f4ff' }}>{result.years_delayed} years</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#8fa4c8' }}>Inflation Rate</div>
                <div style={{ fontWeight: 700, color: '#f0f4ff' }}>{result.inflation_rate}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(139,92,246,0.1)', borderLeft: '4px solid #8b5cf6', padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.8rem', color: '#c4b5fd', marginBottom: '0.2rem' }}>Powered by: Wolfram Language Mathematical Engine</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#f0f4ff' }}>Calculation: FV = P(1+r)^t</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: '#8fa4c8' }}>Output: Estimated Future Value</div>
                <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.2rem' }}>{result.analysis.futureValue}</div>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>Purchasing Power Impact</div>
                <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '1.2rem' }}>-{result.analysis.purchasingPowerLoss}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#a0b8d0', fontStyle: 'italic' }}>
              Explanation: "This estimates the financial impact of delayed recovery using historical inflation rates. It does not represent actual money loss from the original balance."
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {result && result.success && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            <FinancialImpactCard data={result} />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <Link to="/chat" style={{
                flex: 1, minWidth: '160px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', padding: '0.9rem 1rem',
                background: 'linear-gradient(135deg, #d4a017, #b8860b)',
                border: 'none', borderRadius: '12px',
                color: '#0f1f3d', fontWeight: 800, fontSize: '0.95rem',
                textDecoration: 'none', boxShadow: '0 4px 14px rgba(212,160,23,0.3)',
              }}>
                💬 Ask Varasat Mitra
              </Link>
              <Link to="/analyze" style={{
                flex: 1, minWidth: '160px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', padding: '0.9rem 1rem',
                background: 'transparent',
                border: '2px solid rgba(212,160,23,0.4)', borderRadius: '12px',
                color: '#d4a017', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none',
              }}>
                🔍 Analyse Document
              </Link>
            </div>
          </div>
        )}

        {/* ── How it works ── */}
        {!result && (
          <div style={{
            background:   'rgba(15,28,55,0.5)',
            border:       '1px solid rgba(212,160,23,0.1)',
            borderRadius: '16px',
            padding:      '1.25rem 1.5rem',
            animation:    'fadeInUp 0.4s ease 0.2s both',
          }}>
            <div style={{ fontWeight: 700, color: '#d4a017', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ⚡ How This Works
            </div>
            {[
              { step: '1', icon: '📝', text: 'You enter the asset amount and how many years it has been unclaimed.' },
              { step: '2', icon: '🔢', text: 'Wolfram Language (same engine as Wolfram|Alpha) computes precise inflation-adjusted values using compound interest formulas.' },
              { step: '3', icon: '⚖️', text: 'Claude AI reads the Wolfram numbers and explains them in simple, warm language your family can understand.' },
              { step: '4', icon: '📊', text: 'You see exactly how much value has been lost to inflation — and how much you gain by recovering the asset now.' },
            ].map(item => (
              <div key={item.step} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                marginBottom: '0.75rem',
              }}>
                <span style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4a017, #b8860b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, color: '#0f1f3d', flexShrink: 0,
                }}>{item.step}</span>
                <div>
                  <span style={{ fontSize: '1rem', marginRight: '0.4rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.9rem', color: '#a0b8d0', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
