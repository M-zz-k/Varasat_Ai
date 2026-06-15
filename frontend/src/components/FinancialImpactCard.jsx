/**
 * FinancialImpactCard.jsx
 *
 * Reusable component that displays Wolfram-computed financial impact data
 * and Claude's plain-language explanation.
 *
 * Props:
 *   data       {Object}  - API response from POST /api/analytics/impact
 *   compact    {boolean} - Compact mode for embedding in other pages
 */

import { useState } from 'react';

// ── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sublabel, variant = 'default' }) {
  const colors = {
    default:  { border: 'rgba(99,102,241,0.15)',  bg: 'rgba(248,250,252,0.95)',    val: '#1e293b' },
    positive: { border: 'rgba(16,185,129,0.25)',  bg: 'rgba(240,253,250,0.95)',    val: '#047857' },
    negative: { border: 'rgba(239,68,68,0.25)',   bg: 'rgba(254,242,242,0.95)',    val: '#b91c1c' },
    gold:     { border: 'rgba(245,158,11,0.3)',   bg: 'rgba(254,243,199,0.95)',    val: '#b45309' },
  };
  const c = colors[variant] || colors.default;

  return (
    <div style={{
      padding:      '1.1rem 1.2rem',
      background:   c.bg,
      border:       `1px solid ${c.border}`,
      borderRadius: '14px',
      display:      'flex',
      flexDirection:'column',
      gap:          '0.35rem',
      transition:   'transform 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600,
        letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: c.val, lineHeight: 1.2 }}>
        {value}
      </div>
      {sublabel && (
        <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function LossBar({ percent }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        fontSize: '0.82rem', color: '#475569', marginBottom: '0.4rem' }}>
        <span>Original value</span>
        <span style={{ color: '#b91c1c', fontWeight: 700 }}>
          {percent}% purchasing power lost
        </span>
      </div>
      <div style={{
        height: '12px', background: 'rgba(0,0,0,0.06)',
        borderRadius: '6px', overflow: 'hidden', position: 'relative',
      }}>
        {/* Remaining */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${100 - percent}%`,
          background: 'linear-gradient(90deg, #10b981, #34d399)',
          borderRadius: '6px 0 0 6px',
          transition: 'width 1s ease',
        }} />
        {/* Lost */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: `${percent}%`,
          background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          borderRadius: '0 6px 6px 0',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem' }}>
        <span style={{ color: '#047857' }}>▩ Real value today</span>
        <span style={{ color: '#b91c1c' }}>▩ Inflation erosion</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function FinancialImpactCard({ data, compact = false }) {
  const [showInsight, setShowInsight] = useState(true);

  if (!data || !data.success) return null;

  const { analysis, original_amount, years_delayed, inflation_rate,
          financial_insight, raw } = data;

  const lossPercent = raw?.purchasingPowerLossPercent ?? 0;

  return (
    <div style={{
      background:   'linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)',
      border:       '1px solid rgba(245,158,11,0.25)',
      borderRadius: '20px',
      overflow:     'hidden',
      fontFamily:   "'Inter', sans-serif",
      boxShadow:    '0 10px 30px rgba(0,0,0,0.03)',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding:    '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(59,130,246,0.05))',
        borderBottom: '1px solid rgba(245,158,11,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🧮</span>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>
            Financial Impact Analysis
          </span>
          <span style={{
            marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700,
            padding: '0.2rem 0.6rem', borderRadius: '999px',
            background: 'rgba(245,158,11,0.1)', color: '#b45309',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            Wolfram Powered
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
          Asset: <strong style={{ color: '#b45309' }}>{original_amount}</strong>
          &nbsp;·&nbsp;Delayed: <strong style={{ color: '#b91c1c' }}>{years_delayed} years</strong>
          &nbsp;·&nbsp;Inflation: <strong style={{ color: '#475569' }}>{inflation_rate}</strong>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: compact ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Purchasing power loss bar */}
        <LossBar percent={lossPercent} />

        {/* Metric grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: compact
            ? 'repeat(auto-fit, minmax(140px, 1fr))'
            : 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
        }}>
          <MetricCard
            icon="💰"
            label="Asset Value"
            value={original_amount}
            sublabel="Original amount"
            variant="gold"
          />
          <MetricCard
            icon="📉"
            label="Delay Impact"
            value={analysis.purchasingPowerLoss}
            sublabel={`${lossPercent}% of value lost`}
            variant="negative"
          />
          <MetricCard
            icon="💵"
            label="Real Value Today"
            value={analysis.realValueToday}
            sublabel="In today's money"
            variant="default"
          />
          <MetricCard
            icon="📈"
            label="Recovery Benefit"
            value={analysis.annualRecoveryBenefit}
            sublabel="Gained by recovering now vs. 1 more year"
            variant="positive"
          />
          {!compact && (
            <MetricCard
              icon="🚀"
              label="Growth Potential"
              value={analysis.futureValue}
              sublabel={`If invested at ${inflation_rate} for ${years_delayed} yrs`}
              variant="gold"
            />
          )}
        </div>

        {/* Wolfram engine badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.6rem 1rem',
          background: 'rgba(245,158,11,0.04)',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: '10px',
          fontSize: '0.78rem', color: '#475569',
        }}>
          <span style={{ fontSize: '1rem' }}>⚡</span>
          <span>
            Calculated by <strong style={{ color: '#b45309' }}>Wolfram Language</strong> —
            the same computational engine behind Wolfram|Alpha and Mathematica.
            Results are mathematically precise.
          </span>
        </div>

        {/* Claude explanation */}
        {financial_insight && (
          <div style={{
            background:   'rgba(248,250,252,0.95)',
            border:       '1px solid rgba(203,213,225,0.8)',
            borderRadius: '14px',
            overflow:     'hidden',
          }}>
            <button
              onClick={() => setShowInsight(v => !v)}
              style={{
                width:          '100%',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '0.9rem 1.1rem',
                background:     'none',
                border:         'none',
                cursor:         'pointer',
                color:          '#1e293b',
                fontWeight:     700,
                fontSize:       '0.9rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚖️</span> Varasat Mitra Explains
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>
                {showInsight ? '▲ Hide' : '▼ Show'}
              </span>
            </button>

            {showInsight && (
              <div style={{
                padding:    '0 1.1rem 1.1rem',
                color:      '#334155',
                fontSize:   '0.95rem',
                lineHeight: 1.75,
                borderTop:  '1px solid rgba(203,213,225,0.5)',
                paddingTop: '0.85rem',
              }}>
                {financial_insight.split('\n\n').map((para, i) => (
                  <p key={i} style={{ margin: '0 0 0.75rem' }}>{para}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <p style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', margin: 0 }}>
          Calculations use compound inflation formula via Wolfram Alpha API.
          For actual legal and financial advice, consult a qualified professional.
        </p>
      </div>
    </div>
  );
}
