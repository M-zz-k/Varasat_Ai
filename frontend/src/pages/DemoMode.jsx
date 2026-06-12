import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AssetGraph from '../components/AssetGraph';

export default function DemoMode() {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Demo Nodes for Asset Graph
  const demoNodes = [
    { id: 'p1', type: 'person', position: { x: 250, y: 50 }, data: { label: 'Ramesh Kumar\n(Deceased Father)' } },
    { id: 'a1', type: 'asset', position: { x: 50, y: 200 }, data: { institution: 'SBI', type: 'Savings Account', amount: '245000' } },
    { id: 'a2', type: 'asset', position: { x: 250, y: 200 }, data: { institution: 'LIC', type: 'Life Policy', amount: '500000' } },
    { id: 'a3', type: 'asset', position: { x: 450, y: 200 }, data: { institution: 'Mutual Fund', type: 'Equity', amount: '200000' } },
  ];

  const demoEdges = [
    { id: 'e1', source: 'p1', target: 'a1', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
    { id: 'e2', source: 'p1', target: 'a2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
    { id: 'e3', source: 'p1', target: 'a3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  ];

  const handleGeneratePdf = async () => {
    setLoadingPdf(true);
    try {
      // Use existing API to generate a real PDF using the demo data
      const response = await axios.post('/api/document/generate-pdf', {
        documentType: 'Affidavit',
        claimData: {
          claimantName: 'Demo User',
          deceasedName: 'Ramesh Kumar',
          relation: 'Son/Daughter',
          institution: 'SBI, LIC, Mutual Fund',
          assetType: 'Multiple Assets',
          amount: '945000'
        }
      }, {
        responseType: 'arraybuffer'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Varasat_Demo_Affidavit.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setPdfSuccess(true);
    } catch (err) {
      console.error('Demo PDF generation failed:', err);
      alert('PDF generation failed. Please check backend connection.');
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #051020 0%, #0a1628 100%)', fontFamily: "'Inter', sans-serif", paddingBottom: '4rem' }}>
      
      {/* Header */}
      <header style={{ padding: '1rem 2rem', background: 'rgba(5,16,32,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(240,192,64,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ color: '#8fa4c8', textDecoration: 'none', fontSize: '0.95rem' }}>← Home</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚖️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f4ff' }}>Judge Demo Mode</div>
              <div style={{ fontSize: '0.72rem', color: '#f59e0b' }}>Prototype Simulation</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0.3rem 0.8rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '999px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
          ⚠️ DEMO DATA
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.25rem' }}>
        
        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: '#f0f4ff', marginBottom: '0.5rem' }}>
            Complete Varasat Journey
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#8fa4c8', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
            Experience the full pipeline from document extraction to document generation, using simulated family data.
          </p>
        </div>

        {/* STEP 1: Assets Found */}
        <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#3b82f6' }}></div>
          <h2 style={{ fontSize: '1.4rem', color: '#f0f4ff', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ background: '#3b82f6', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
            Step 1: Assets Found
          </h2>
          <p style={{ color: '#8fa4c8', marginBottom: '1.5rem' }}>AI discovered these possible inherited assets based on the uploaded family documents.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
            {/* Profile */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.85rem', color: '#8fa4c8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '0.5rem' }}>DEMO FAMILY PROFILE</div>
              <div style={{ fontSize: '1.2rem', color: '#f0f4ff', fontWeight: 700 }}>Ramesh Kumar</div>
              <div style={{ fontSize: '0.95rem', color: '#a0b8d0', marginBottom: '1.5rem' }}>Relationship: Son/Daughter</div>

              <div style={{ fontSize: '0.85rem', color: '#8fa4c8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '0.75rem' }}>DETECTED ASSETS</div>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontStyle: 'italic', marginBottom: '0.75rem' }}>"These are sample assets used for demonstration."</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#c8d8f0' }}>🏦 SBI Savings</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>₹2,45,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#c8d8f0' }}>📄 LIC Policy</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>₹5,00,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#c8d8f0' }}>📈 Mutual Fund</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>₹2,00,000</span>
                </div>
              </div>
            </div>

            {/* Graph */}
            <div style={{ height: '350px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <AssetGraph graphData={{ nodes: demoNodes, edges: demoEdges }} />
            </div>
          </div>
        </section>

        {/* STEP 2: Financial Analysis */}
        <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#8b5cf6' }}></div>
          <h2 style={{ fontSize: '1.4rem', color: '#f0f4ff', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ background: '#8b5cf6', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>2</span>
            Step 2: Financial Analysis
          </h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p style={{ color: '#8fa4c8', margin: 0 }}>Wolfram calculates the inflation impact on unclaimed legacy.</p>
            <div style={{ padding: '0.3rem 0.8rem', background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)', borderRadius: '999px', color: '#f0c040', fontSize: '0.85rem', fontWeight: 700 }}>
              ⚡ Powered by Wolfram Language
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#8fa4c8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Assets</div>
              <div style={{ color: '#f0f4ff', fontSize: '1.8rem', fontWeight: 800 }}>₹9,45,000</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#8fa4c8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Delayed Recovery</div>
              <div style={{ color: '#ef4444', fontSize: '1.8rem', fontWeight: 800 }}>10 years</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.1)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Estimated Inflation Impact</div>
              <div style={{ color: '#ef4444', fontSize: '1.8rem', fontWeight: 800 }}>-₹3,20,000</div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderLeft: '4px solid #10b981', color: '#a7f3d0', fontSize: '0.95rem' }}>
            <strong>💡 Insight:</strong> Recovering assets earlier can preserve financial value against market inflation.
          </div>
        </section>

        {/* STEP 3: Claim Ready */}
        <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#f0c040' }}></div>
          <h2 style={{ fontSize: '1.4rem', color: '#f0f4ff', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ background: '#f0c040', color: '#000', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>3</span>
            Step 3: Claim Ready
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#f0f4ff', marginBottom: '1rem' }}>Inheritance Recovery Assessment</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#8fa4c8' }}>Eligibility</span>
                <span style={{ color: '#10b981', fontWeight: 800 }}>92%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#8fa4c8' }}>Risk Level</span>
                <span style={{ color: '#10b981', fontWeight: 800 }}>Low</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                <span style={{ color: '#8fa4c8' }}>Estimated Processing Time</span>
                <span style={{ color: '#f0f4ff', fontWeight: 700 }}>15 Days</span>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f0f4ff', marginBottom: '1rem' }}>Required Documents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ color: '#a7f3d0' }}>✓ Death Certificate</div>
                <div style={{ color: '#a7f3d0' }}>✓ Identity Proof</div>
                <div style={{ color: '#a7f3d0' }}>✓ Relationship Proof</div>
                <div style={{ color: '#fca5a5' }}>⏳ Legal Affidavit</div>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 4: Documents Generated */}
        <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#10b981' }}></div>
          <h2 style={{ fontSize: '1.4rem', color: '#f0f4ff', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ background: '#10b981', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>4</span>
            Step 4: Documents Generated
          </h2>
          
          <p style={{ color: '#8fa4c8', marginBottom: '1.5rem' }}>
            AI has drafted the exact legal language required by SBI, LIC, and the Mutual Fund house. Generate the printable PDF now.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            {pdfSuccess ? (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#a7f3d0', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#10b981' }}>Affidavit Generated!</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>The demo document has been downloaded to your device.</p>
              </div>
            ) : (
              <button 
                onClick={handleGeneratePdf}
                disabled={loadingPdf}
                className="btn-primary" 
                style={{ padding: '1.25rem 3rem', fontSize: '1.15rem', borderRadius: '999px', boxShadow: '0 8px 24px rgba(240,192,64,0.3)', opacity: loadingPdf ? 0.7 : 1 }}
              >
                {loadingPdf ? '⏳ Generating AI Document...' : '📄 Generate Legal Affidavit'}
              </button>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
