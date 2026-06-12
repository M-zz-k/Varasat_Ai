import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ClaimAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get asset data passed from previous page, otherwise use default
  const initialAssetData = location.state?.assetData || {
    amount: 500000,
    nomineeExists: true,
    documentCount: 3,
    assetType: "Bank Account"
  };

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function analyzeClaim() {
      try {
        const res = await axios.post('/api/claim/analyze', {
          assetData: initialAssetData,
          userDetails: {}
        });
        setResult(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to analyze claim.');
      } finally {
        setLoading(false);
      }
    }
    analyzeClaim();
  }, [initialAssetData]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a1628', color: '#8fa4c8' }}>
        <div style={{ fontSize: '3rem', animation: 'pulse 1.5s infinite' }}>⚙️</div>
        <h2 style={{ marginTop: '1rem', color: '#f0f4ff' }}>Varasat AI is analyzing claim eligibility...</h2>
        <p>Using Wolfram Language for mathematical risk scoring</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a1628', color: '#fca5a5', textAlign: 'center' }}>
        <h2>⚠️ Analysis Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginTop: '1rem' }}>Go Back</button>
      </div>
    );
  }

  const { analysis, recommendation, requiredDocuments } = result;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0f1f3d 100%)', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '1rem 2rem', background: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,160,23,0.15)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#8fa4c8', cursor: 'pointer', fontSize: '0.95rem' }}>← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚖️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f4ff' }}>Claim Intelligence</div>
            <div style={{ fontSize: '0.72rem', color: '#8fa4c8' }}>Powered by Wolfram & Claude</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#f0f4ff', textAlign: 'center', marginBottom: '2rem' }}>
          Claim Eligibility Assessment
        </h1>

        {/* Scores Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center', borderTop: '4px solid #10b981' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '0.8rem', color: '#8fa4c8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Eligibility Score</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>{analysis.eligibilityScore}<span style={{ fontSize: '1rem', color: '#5a7a9a' }}>/100</span></div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center', borderTop: `4px solid ${analysis.complexity === 'High' ? '#ef4444' : '#f59e0b'}` }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontSize: '0.8rem', color: '#8fa4c8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Risk & Complexity</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f4ff', margin: '0.5rem 0' }}>{analysis.complexity}</div>
            <div style={{ fontSize: '0.85rem', color: '#a0b8d0' }}>Wolfram Risk Score: {analysis.riskScore}</div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontSize: '0.8rem', color: '#8fa4c8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Estimated Time</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>{analysis.estimatedDays}</div>
            <div style={{ fontSize: '0.85rem', color: '#a0b8d0' }}>Business Days</div>
          </div>

        </div>

        {/* AI Recommendation */}
        <div style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.1), rgba(184,134,11,0.05))', border: '1px solid rgba(212,160,23,0.3)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f0c040', margin: 0 }}>AI Legal Recommendation</h2>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#e8f0ff', lineHeight: 1.6, margin: 0 }}>
            {recommendation}
          </p>
        </div>

        {/* Required Documents */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📄</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f4ff', margin: 0 }}>Required Documents</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
            {requiredDocuments.map((doc, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span style={{ color: '#c8d8f0', fontSize: '0.95rem' }}>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/chat" className="btn-secondary" style={{ flex: 1, textAlign: 'center', minWidth: '200px', padding: '1rem' }}>
            💬 Talk to Varasat Mitra
          </Link>
          <Link to="/generate-document" state={{ assetData: initialAssetData }} className="btn-primary" style={{ flex: 1, textAlign: 'center', minWidth: '200px', padding: '1rem' }}>
            📄 Generate Legal Documents
          </Link>
        </div>

      </main>
    </div>
  );
}
