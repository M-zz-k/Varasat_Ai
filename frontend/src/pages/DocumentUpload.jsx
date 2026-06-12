import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import JourneyHeader from '../components/JourneyHeader';
import { analyzeDocument } from '../services/documentApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_MB    = 10;

const ASSET_ICONS = {
  'savings account':  '🏦',
  'current account':  '🏦',
  'fixed deposit':    '💰',
  'fd':               '💰',
  'lic policy':       '📋',
  'insurance':        '📋',
  'ppf':              '📈',
  'provident fund':   '📈',
  'epf':              '📈',
  'mutual fund':      '📊',
  'shares':           '📊',
  'nps':              '🏛️',
  'default':          '📄',
};

function getAssetIcon(assetType) {
  if (!assetType) return '📄';
  const key = assetType.toLowerCase();
  for (const [k, v] of Object.entries(ASSET_ICONS)) {
    if (key.includes(k)) return v;
  }
  return '📄';
}

function confidenceColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ value }) {
  return (
    <div style={{
      height: '8px', background: 'rgba(255,255,255,0.08)',
      borderRadius: '4px', overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', width: `${value}%`,
        background: 'linear-gradient(90deg, #d4a017, #f0c040)',
        borderRadius: '4px',
        transition: 'width 0.35s ease',
      }} />
    </div>
  );
}

function ConfidenceMeter({ score }) {
  const color = confidenceColor(score);
  const label = score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.82rem', color: '#8fa4c8' }}>AI Confidence</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{score}% — {label}</span>
      </div>
      <div style={{
        height: '10px', background: 'rgba(255,255,255,0.08)',
        borderRadius: '5px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${score}%`,
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          borderRadius: '5px', transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

function DataRow({ icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div style={{
      display:      'flex',
      alignItems:   'flex-start',
      gap:          '0.85rem',
      padding:      '0.9rem 1rem',
      background:   highlight ? 'rgba(212,160,23,0.07)' : 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      border:       `1px solid ${highlight ? 'rgba(212,160,23,0.2)' : 'rgba(255,255,255,0.06)'}`,
      marginBottom: '0.5rem',
    }}>
      <span style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.73rem', color: '#6a8aaa', fontWeight: 600,
          letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
          {label}
        </div>
        <div style={{
          fontSize:   highlight ? '1.2rem' : '1rem',
          fontWeight: highlight ? 800 : 600,
          color:      highlight ? '#f0c040' : '#e8f0ff',
          wordBreak:  'break-word',
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function AIAnalysisCard({ data, file, financialInsight }) {
  const assetIcon = getAssetIcon(data.asset_type);
  const score     = data.confidence_score ?? 0;

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease both' }}>

      {/* ── Success header ── */}
      <div style={{
        textAlign:    'center',
        padding:      '1.5rem 1rem',
        background:   'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(212,160,23,0.05))',
        border:       '1px solid rgba(16,185,129,0.2)',
        borderRadius: '16px',
        marginBottom: '1.25rem',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#10b981' }}>
          AI Analysis Complete
        </div>
        <div style={{ fontSize: '0.88rem', color: '#8fa4c8', marginTop: '0.25rem' }}>
          {file.originalName} · {file.size}
        </div>
      </div>

      {/* ── Asset discovery banner ── */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '1rem',
        padding:      '1rem 1.25rem',
        background:   'rgba(212,160,23,0.1)',
        border:       '1px solid rgba(212,160,23,0.3)',
        borderRadius: '14px',
        marginBottom: '1.25rem',
      }}>
        <span style={{ fontSize: '2.5rem' }}>{assetIcon}</span>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#d4a017', fontWeight: 700,
            letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Assets Identified from Available Documents
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0f4ff' }}>
            {data.asset_type || 'Financial Asset'}
            {data.institution && ` — ${data.institution}`}
          </div>
        </div>
      </div>

      {/* ── Extracted fields ── */}
      <div style={{
        background:   'rgba(15,28,55,0.6)',
        border:       '1px solid rgba(212,160,23,0.12)',
        borderRadius: '16px',
        padding:      '1.25rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#d4a017',
          marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🔍 Extracted Information
        </div>
        <div style={{ fontSize: '0.8rem', color: '#8fa4c8', marginBottom: '1rem', fontStyle: 'italic' }}>
          Varasat extracts asset information from uploaded family documents using AI document intelligence.
        </div>

        <DataRow icon="👤" label="Account Holder"  value={data.person_name}      highlight />
        <DataRow icon="🏦" label="Institution"      value={data.institution}      highlight />
        <DataRow icon="💰" label="Amount / Balance" value={data.amount}           highlight />
        <DataRow icon="📄" label="Asset Type"       value={data.asset_type}                />
        <DataRow icon="🔢" label="Account Number"   value={data.account_number}            />
        <DataRow icon="📋" label="Policy Number"    value={data.policy_number}             />
        <DataRow icon="👥" label="Nominee"          value={data.nominee}                   />
        <DataRow icon="📅" label="Document Date"    value={data.date_of_document}          />
        <DataRow icon="📍" label="Branch / Address" value={data.branch_address}            />
      </div>

      {/* ── Financial Insight & Wolfram Data ── */}
      {(financialInsight || data.real_value_today) && (
        <div style={{
          background:   'linear-gradient(135deg, rgba(22,42,78,0.6), rgba(15,28,55,0.8))',
          border:       '1px solid rgba(99,140,220,0.3)',
          borderRadius: '16px',
          padding:      '1.25rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚖️</span>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#c8d8f0' }}>Varasat Mitra Insight</span>
          </div>
          {financialInsight && (
            <p style={{ fontSize: '0.95rem', color: '#a0b8d0', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
              {financialInsight}
            </p>
          )}
          {data.real_value_today > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.8rem', background: 'rgba(212,160,23,0.1)',
              border: '1px solid rgba(212,160,23,0.2)', borderRadius: '8px',
            }}>
              <span style={{ fontSize: '1.1rem' }}>⚡</span>
              <div style={{ fontSize: '0.85rem', color: '#e8f0ff' }}>
                <span style={{ color: '#d4a017', fontWeight: 600 }}>Wolfram Valuation:</span> Estimated real value today (after 1 yr 6% inflation): <strong style={{ color: '#f0c040' }}>₹{data.real_value_today.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Confidence meter ── */}
      <div style={{
        background:   'rgba(15,28,55,0.6)',
        border:       '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding:      '1rem 1.25rem',
        marginBottom: '1.25rem',
      }}>
        <ConfidenceMeter score={score} />
        {score < 60 && (
          <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.5rem', lineHeight: 1.5 }}>
            ⚠️ Low confidence — the document may be blurry or handwritten. For better results, try
            a clearer, high-resolution photo of the document.
          </p>
        )}
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link to="/chat" style={{
          flex:           1, minWidth: '160px',
          display:        'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap:            '0.5rem',
          padding:        '0.95rem 1rem',
          background:     'linear-gradient(135deg, #d4a017, #b8860b)',
          color:          '#0f1f3d', fontWeight: 800,
          fontSize:       '0.95rem', borderRadius: '12px',
          textDecoration: 'none',
          boxShadow:      '0 4px 14px rgba(212,160,23,0.35)',
          transition:     'transform 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          💬 Ask Varasat Mitra
        </Link>

        <Link to="/asset-discovery" style={{
          flex:           1, minWidth: '160px',
          display:        'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap:            '0.5rem',
          padding:        '0.95rem 1rem',
          background:     'transparent',
          color:          '#10b981', fontWeight: 700,
          fontSize:       '0.95rem', borderRadius: '12px',
          border:         '2px solid #10b981',
          textDecoration: 'none',
          transition:     'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          🗺️ View Asset Map
        </Link>

        <Link to="/claim-analysis" state={{ assetData: data }} style={{
          flex:           1, minWidth: '160px',
          display:        'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap:            '0.5rem',
          padding:        '0.95rem 1rem',
          background:     'transparent',
          color:          '#d4a017', fontWeight: 700,
          fontSize:       '0.95rem', borderRadius: '12px',
          border:         '2px solid #d4a017',
          textDecoration: 'none',
          transition:     'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,160,23,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ⚖️ Analyze Claim
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentUpload() {
  const [data, setData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [dragOver,   setDragOver]   = useState(false);
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null);   // image preview URL
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [analyzing,  setAnalyzing]  = useState(false);  // AI working indicator
  const [result,     setResult]     = useState(null);   // API response
  const [error,      setError]      = useState('');

  const inputRef = useRef(null);

  // Ramesh Kumar Hackathon Demo Mode
  const runDemoMode = () => {
    setLoading(true);
    setTimeout(() => {
      setData({
        personName: 'Ramesh Kumar',
        institution: 'Multiple Discovered (SBI, LIC, Mutual Fund)',
        assetType: 'Bank Account, Life Insurance, Equity',
        amount: '880000',
        confidenceScore: '98%',
        financialInsight: 'Recovering this asset earlier could significantly preserve family wealth against inflation.',
        adjustedValue: '₹9,60,000'
      });
      setLoading(false);
      setSuccess(true);
    }, 1500); // simulate API delay
  };

  // ── File validation and selection ──────────────────────────────────────────
  const selectFile = useCallback((f) => {
    if (!f) return;

    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Only PDF, JPG, and PNG files are supported.');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB} MB.`);
      return;
    }

    setError('');
    setResult(null);
    setProgress(0);
    setFile(f);

    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragOver(true);  };
  const onDragLeave = ()  => setDragOver(false);
  const onDrop      = (e) => { e.preventDefault(); setDragOver(false); selectFile(e.dataTransfer.files[0]); };

  // ── Analyze ───────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!file || uploading) return;

    setUploading(true);
    setAnalyzing(false);
    setError('');
    setProgress(0);

    try {
      // Phase 1: upload (progress 0→70)
      const onProg = (p) => setProgress(Math.min(p * 0.7, 70));

      setAnalyzing(false);
      const data = await analyzeDocument(file, onProg);

      // Phase 2: AI thinking (progress 70→100 simulated)
      setAnalyzing(true);
      setProgress(85);
      await new Promise(r => setTimeout(r, 600)); // brief pause for UX
      setProgress(100);

      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }

  function reset() {
    setFile(null); setPreview(null);
    setProgress(0); setResult(null);
    setError(''); setUploading(false); setAnalyzing(false);
    setData(null); setSuccess(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:  '100vh',
      background: 'linear-gradient(160deg, #051020 0%, #0a1628 100%)',
      fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif",
    }}>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '1rem',
        padding:        '1rem 2rem',
        background:     'rgba(5,16,32,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom:   '1px solid rgba(212,160,23,0.15)',
        position:       'sticky', top: 0, zIndex: 50,
      }}>
        <Link to="/" style={{
          color: '#8fa4c8', textDecoration: 'none',
          fontSize: '0.95rem', fontWeight: 600,
        }}>← Home</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🔍</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f4ff' }}>
              AI Document Analysis
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8fa4c8' }}>
              Varasat Asset Discovery Engine
            </div>
          </div>
        </div>
      </header>

      <JourneyHeader currentStep={1} />

      {/* ── Main content ── */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.25rem 3rem' }}>

        {/* ── Page heading ── */}
        {!result && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize:    'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight:  800,
              color:       '#f0f4ff',
              lineHeight:  1.2,
              marginBottom: '0.5rem',
            }}>
              Step 1: Discover Your Family Assets
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#8fa4c8', lineHeight: 1.6 }}>
              Upload any financial document to let Varasat securely extract hidden assets.
            </p>
          </div>
        )}

        {/* ── Drop zone ── */}
        {!result && (
          <>
            <div
              onClick={() => !uploading && inputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{
                border:       `2px dashed ${dragOver ? '#d4a017' : file ? 'rgba(16,185,129,0.4)' : 'rgba(212,160,23,0.3)'}`,
                borderRadius: '20px',
                padding:      '2.5rem 1.5rem',
                textAlign:    'center',
                cursor:       uploading ? 'not-allowed' : 'pointer',
                background:   dragOver
                  ? 'rgba(212,160,23,0.06)'
                  : file
                    ? 'rgba(16,185,129,0.04)'
                    : 'rgba(22,40,72,0.3)',
                transition:   'all 0.2s ease',
                marginBottom: '1.25rem',
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={(e) => selectFile(e.target.files[0])}
              />

              {file ? (
                /* ── File selected state ── */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  {preview ? (
                    <img src={preview} alt="Document preview"
                      style={{ maxHeight: '200px', borderRadius: '12px', objectFit: 'contain',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }} />
                  ) : (
                    <div style={{ fontSize: '3.5rem' }}>📄</div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f0f4ff' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#8fa4c8' }}>
                    {(file.size / 1024).toFixed(1)} KB
                    &nbsp;·&nbsp;
                    {file.type === 'application/pdf' ? 'PDF Document' : 'Image'}
                  </div>
                  {!uploading && (
                    <span style={{
                      fontSize: '0.8rem', color: '#10b981',
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: '999px', padding: '0.2rem 0.75rem',
                    }}>✓ Ready to analyse</span>
                  )}
                </div>
              ) : (
                /* ── Empty state ── */
                <div>
                  <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>☁️</div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f0f4ff', marginBottom: '0.4rem' }}>
                    Choose File
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#8fa4c8', marginBottom: '0.35rem' }}>
                    or drag and drop it here
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#5a7a9a' }}>
                    PDF, JPG, PNG · Maximum {MAX_SIZE_MB} MB
                  </div>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', color: '#8fa4c8', fontSize: '0.85rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              Varasat analyzes documents you provide. It does not directly access bank databases.
            </div>

            {/* ── Error banner ── */}
            {error && (
              <div style={{
                display:      'flex', alignItems: 'center', justifyContent: 'space-between',
                padding:      '0.8rem 1.1rem', borderRadius: '10px',
                background:   'rgba(220,50,50,0.12)',
                border:       '1px solid rgba(220,50,50,0.3)',
                color:        '#fca5a5', fontSize: '0.9rem',
                marginBottom: '1rem', gap: '0.75rem',
              }}>
                <span>⚠️ {error}</span>
                <button onClick={() => setError('')} style={{
                  background: 'none', border: 'none', color: '#fca5a5',
                  cursor: 'pointer', fontSize: '1rem',
                }}>✕</button>
              </div>
            )}

            {/* ── Progress bar (during upload + AI) ── */}
            {uploading && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.85rem', color: '#8fa4c8', marginBottom: '0.4rem',
                }}>
                  <span style={{ animation: 'pulse 1.5s ease infinite' }}>
                    {analyzing ? '🤖 AI is reading the document…' : '⬆️ Uploading…'}
                  </span>
                  <span>{progress}%</span>
                </div>
                <ProgressBar value={progress} />
              </div>
            )}

            {/* ── Action buttons ── */}
            {file && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleAnalyze}
                  disabled={uploading}
                  style={{
                    flex:         1,
                    padding:      '1rem',
                    background:   uploading
                      ? 'rgba(212,160,23,0.3)'
                      : 'linear-gradient(135deg, #d4a017, #b8860b)',
                    border:       'none',
                    borderRadius: '12px',
                    color:        uploading ? '#7a6030' : '#0f1f3d',
                    fontWeight:   800,
                    fontSize:     '1rem',
                    cursor:       uploading ? 'not-allowed' : 'pointer',
                    boxShadow:    uploading ? 'none' : '0 4px 16px rgba(212,160,23,0.35)',
                    transition:   'all 0.15s',
                    display:      'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                >
                  {uploading ? (
                    <>
                      <span style={{
                        width: '16px', height: '16px', border: '2px solid #7a6030',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite', display: 'inline-block',
                      }} />
                      {analyzing ? 'AI Analysing…' : 'Uploading…'}
                    </>
                  ) : (
                    '🔍 Analyse with AI'
                  )}
                </button>

                <button
                  onClick={reset}
                  disabled={uploading}
                  style={{
                    padding:      '1rem 1.25rem',
                    background:   'transparent',
                    border:       '2px solid rgba(212,160,23,0.3)',
                    borderRadius: '12px',
                    color:        '#8fa4c8',
                    fontSize:     '0.95rem',
                    cursor:       uploading ? 'not-allowed' : 'pointer',
                    transition:   'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = '#d4a017'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,160,23,0.3)'; }}
                >
                  ✕ Clear
                </button>
              </div>
            )}

            {/* ── Judge Demo Button ── */}
            {!file && (
              <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
                <button
                  onClick={runDemoMode}
                  disabled={loading}
                  className="btn-secondary"
                  style={{
                    padding: '0.8rem 1.5rem', borderRadius: '12px',
                    background: 'rgba(240,192,64,0.1)', color: '#f0c040',
                    border: '1px solid rgba(240,192,64,0.3)',
                    fontSize: '0.95rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(240,192,64,0.1)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,192,64,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(240,192,64,0.1)'}
                >
                  {loading ? 'Running Demo...' : '🚀 Try Judge Demo (No Upload Required)'}
                </button>
              </div>
            )}

            {/* ── Tips card ── */}
            {!file && (
              <div style={{
                background:   'rgba(22,42,78,0.4)',
                border:       '1px solid rgba(212,160,23,0.12)',
                borderRadius: '16px',
                padding:      '1.25rem 1.5rem',
                marginTop:    '1.25rem',
              }}>
                <div style={{ fontWeight: 700, color: '#d4a017', marginBottom: '0.85rem', fontSize: '0.95rem' }}>
                  💡 What to Upload
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { icon: '🏦', text: 'Bank passbook or statement' },
                    { icon: '📋', text: 'LIC or insurance policy'     },
                    { icon: '📈', text: 'PPF / EPF account slip'      },
                    { icon: '📊', text: 'Share certificate or FD'     },
                    { icon: '📜', text: 'Death certificate'           },
                    { icon: '🪪', text: 'Nomination form'             },
                  ].map(item => (
                    <div key={item.text} style={{
                      display:    'flex',
                      alignItems: 'center',
                      gap:        '0.5rem',
                      fontSize:   '0.88rem',
                      color:      '#8fa4c8',
                    }}>
                      <span>{item.icon}</span> {item.text}
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop:  '1rem',
                  fontSize:   '0.78rem',
                  color:      '#4a6a8a',
                  lineHeight: 1.5,
                }}>
                  📸 Tip: For best results, take a clear photo in good lighting. Make sure all text is readable.
                </div>
              </div>
            )}
          </>
        )}

        {/* ── AI Result card ── */}
        {(result && result.success && result.assetFound) || success ? (
          <AIAnalysisCard data={data || result.data} file={file || { originalName: 'Demo_Document.pdf', size: '1.2MB' }} financialInsight={data?.financialInsight || result.financialInsight} />
        ) : null}

        {/* ── Success but no asset identified ── */}
        {result && result.success && !result.assetFound && (
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.4s ease' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔎</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
              No Asset Clearly Identified
            </div>
            <p style={{ fontSize: '0.95rem', color: '#8fa4c8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              The AI could not confidently identify a financial asset in this document.
              This may be because it's a death certificate, ID proof, or a non-financial document.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={reset} style={{
                padding: '0.9rem 1.75rem',
                background: 'linear-gradient(135deg, #d4a017, #b8860b)',
                border: 'none', borderRadius: '12px',
                color: '#0f1f3d', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
              }}>
                Try Another Document
              </button>
              <Link to="/chat" style={{
                padding: '0.9rem 1.75rem',
                background: 'transparent',
                border: '2px solid #d4a017',
                borderRadius: '12px',
                color: '#d4a017', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none',
              }}>
                💬 Ask Mitra for Help
              </Link>
            </div>
          </div>
        )}

        {/* ── API error ── */}
        {result && !result.success && (
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.4s ease' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚠️</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ef4444', marginBottom: '0.5rem' }}>
              Analysis Failed
            </div>
            <p style={{ fontSize: '0.95rem', color: '#8fa4c8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {result.error}
            </p>
            <button onClick={reset} style={{
              padding: '0.9rem 1.75rem',
              background: 'linear-gradient(135deg, #d4a017, #b8860b)',
              border: 'none', borderRadius: '12px',
              color: '#0f1f3d', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
            }}>
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
