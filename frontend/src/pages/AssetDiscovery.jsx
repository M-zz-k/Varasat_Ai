import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAssetGraph } from '../services/assetApi';
import AssetGraph from '../components/AssetGraph';

export default function AssetDiscovery() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [graphResponse, setGraphResponse] = useState(null);

  useEffect(() => {
    async function loadGraph() {
      try {
        // Fetch graph from backend for 'demo' family.
        // In a real app, familyId would come from auth context.
        const res = await fetchAssetGraph('demo');
        setGraphResponse(res);
      } catch (err) {
        setError(err.message || 'Failed to load asset map.');
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a1628', color: '#8fa4c8' }}>
        <div style={{ fontSize: '3rem', animation: 'pulse 1.5s infinite' }}>🌐</div>
        <h2 style={{ marginTop: '1rem', color: '#f0f4ff' }}>Loading Family Asset Graph...</h2>
        <p>Connecting data points...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#0a1628', color: '#fca5a5', textAlign: 'center' }}>
        <h2>⚠️ Could not load map</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginTop: '1rem' }}>Go Back</button>
      </div>
    );
  }

  const { graph, summary, explanation } = graphResponse;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0f1f3d 100%)', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '1rem 2rem', background: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,160,23,0.15)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link to="/" style={{ color: '#8fa4c8', textDecoration: 'none', fontSize: '0.95rem' }}>← Home</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🗺️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f4ff' }}>Asset Map</div>
            <div style={{ fontSize: '0.72rem', color: '#8fa4c8' }}>Knowledge Graph Visualization</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        
        {/* Page Title & Summary */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#f0f4ff', margin: '0 0 0.5rem 0' }}>
              Family Asset Map
            </h1>
            <p style={{ color: '#8fa4c8', margin: 0 }}>Visualizing discovered financial relationships.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#8fa4c8', textTransform: 'uppercase', fontWeight: 600 }}>Total Value Discovered</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{summary?.totalValueFormatted || '₹0'}</div>
            </div>
            <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#8fa4c8', textTransform: 'uppercase', fontWeight: 600 }}>Assets</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6' }}>{summary?.totalAssets || 0}</div>
            </div>
          </div>
        </div>

        {/* AI Graph Explanation */}
        {explanation && (
          <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.05))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#c8d8f0', margin: 0 }}>Varasat AI Summary</h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#e8f0ff', lineHeight: 1.6, margin: 0 }}>
              {explanation}
            </p>
          </div>
        )}

        {/* React Flow Container */}
        <AssetGraph graphData={graph} />

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link to="/upload" className="btn-secondary" style={{ flex: 1, textAlign: 'center', minWidth: '200px', padding: '1rem' }}>
            + Add Another Document
          </Link>
          <Link to="/claim-analysis" className="btn-primary" style={{ flex: 1, textAlign: 'center', minWidth: '200px', padding: '1rem' }}>
            ⚖️ Analyze Claim Eligibility
          </Link>
        </div>

      </main>
    </div>
  );
}
