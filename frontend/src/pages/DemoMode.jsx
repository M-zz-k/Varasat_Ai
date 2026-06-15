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
    <div className="bg-grid-dots relative overflow-hidden" style={{ minHeight: '100vh', background: '#f3f8fc', fontFamily: "'Inter', sans-serif", paddingBottom: '4rem' }}>
      
      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[140px] -top-32 -left-32 pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[140px] -bottom-32 -right-32 pointer-events-none animate-pulse duration-[10s]" />

      {/* Header */}
      <header style={{ padding: '1rem 2rem', background: '#0b1329', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>← Home</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <svg style={{ width: '1.5rem', height: '1.5rem', stroke: '#fbbf24', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17M3 12h18M6 12l2 6h8l2-6" /></svg>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>Judge Demo Mode</div>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>Prototype Simulation</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '999px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700 }}>
          <svg style={{ width: '0.95rem', height: '0.95rem', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          DEMO DATA
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.25rem' }}>
        
        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 850, color: '#0f172a', marginBottom: '0.5rem' }}>
            Complete Varasat Journey
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
            Experience the full pipeline from document extraction to document generation, using simulated family data.
          </p>
        </div>

        {/* STEP 1: Assets Found */}
        <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#2563eb' }}></div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ background: '#2563eb', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>1</span>
            Step 1: Assets Found
          </h2>
          <p style={{ color: '#475569', marginBottom: '1.5rem', fontWeight: 550 }}>AI discovered these possible inherited assets based on the uploaded family documents.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
            {/* Profile */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.5rem' }}>DEMO FAMILY PROFILE</div>
              <div style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>Ramesh Kumar</div>
              <div style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '1.5rem', fontWeight: 600 }}>Relationship: Son/Daughter</div>

              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.75rem' }}>DETECTED ASSETS</div>
              <div style={{ fontSize: '0.75rem', color: '#b45309', fontStyle: 'italic', marginBottom: '0.75rem', fontWeight: 600 }}>"These are sample assets used for demonstration."</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 600 }}>
                    <svg style={{ width: '1.1rem', height: '1.1rem', stroke: '#2563eb', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V10M5 21V10M2 10l10-7 10 7M3 21h18M12 21V10" /></svg>
                    SBI Savings
                  </span>
                  <span style={{ color: '#047857', fontWeight: 800 }}>₹2,45,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 600 }}>
                    <svg style={{ width: '1.1rem', height: '1.1rem', stroke: '#8b5cf6', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    LIC Policy
                  </span>
                  <span style={{ color: '#047857', fontWeight: 800 }}>₹5,00,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 600 }}>
                    <svg style={{ width: '1.1rem', height: '1.1rem', stroke: '#b45309', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    Mutual Fund
                  </span>
                  <span style={{ color: '#047857', fontWeight: 800 }}>₹2,00,000</span>
                </div>
              </div>
            </div>

            {/* Graph */}
            <div style={{ height: '350px', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <AssetGraph graphData={{ nodes: demoNodes, edges: demoEdges }} />
            </div>
          </div>
        </section>

        {/* STEP 2: Financial Analysis */}
        <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#8b5cf6' }}></div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ background: '#8b5cf6', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>2</span>
            Step 2: Financial Analysis
          </h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p style={{ color: '#475569', margin: 0, fontWeight: 550 }}>Wolfram calculates the inflation impact on unclaimed legacy.</p>
            <div style={{ padding: '0.3rem 0.8rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '999px', color: '#b45309', fontSize: '0.85rem', fontWeight: 700 }}>
              ⚡ Powered by Wolfram Language
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Total Assets</div>
              <div style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: 850 }}>₹9,45,000</div>
            </div>
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Delayed Recovery</div>
              <div style={{ color: '#b91c1c', fontSize: '1.8rem', fontWeight: 850 }}>10 years</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.04)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ color: '#b91c1c', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 700 }}>Estimated Inflation Impact</div>
              <div style={{ color: '#b91c1c', fontSize: '1.8rem', fontWeight: 850 }}>-₹3,20,000</div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981', color: '#047857', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <svg style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, stroke: '#10b981', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V21h-2v-3.3a5 5 0 00-3.536-1.8z" /></svg>
            <span><strong>Insight:</strong> Recovering assets earlier can preserve financial value against market inflation.</span>
          </div>
        </section>

        {/* STEP 3: Claim Ready */}
        <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#f59e0b' }}></div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ background: '#f59e0b', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>3</span>
            Step 3: Claim Ready
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 750 }}>Inheritance Recovery Assessment</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Eligibility</span>
                <span style={{ color: '#047857', fontWeight: 800 }}>92%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Risk Level</span>
                <span style={{ color: '#047857', fontWeight: 800 }}>Low</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Estimated Processing Time</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>15 Days</span>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 750 }}>Required Documents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <svg style={{ width: '1.1rem', height: '1.1rem', stroke: '#10b981', strokeWidth: 2.5, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Death Certificate
                </div>
                <div style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <svg style={{ width: '1.1rem', height: '1.1rem', stroke: '#10b981', strokeWidth: 2.5, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Identity Proof
                </div>
                <div style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <svg style={{ width: '1.1rem', height: '1.1rem', stroke: '#10b981', strokeWidth: 2.5, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Relationship Proof
                </div>
                <div style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <svg style={{ width: '1.1rem', height: '1.1rem', stroke: '#ef4444', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Legal Affidavit
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 4: Documents Generated */}
        <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#10b981' }}></div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ background: '#10b981', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>4</span>
            Step 4: Documents Generated
          </h2>
          
          <p style={{ color: '#475569', marginBottom: '1.5rem', fontWeight: 550 }}>
            AI has drafted the exact legal language required by SBI, LIC, and the Mutual Fund house. Generate the printable PDF now.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            {pdfSuccess ? (
              <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid #10b981', color: '#047857', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', width: '100%' }}>
                <svg style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem auto', stroke: '#10b981', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#047857', fontWeight: 800 }}>Affidavit Generated!</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>The demo document has been downloaded to your device.</p>
              </div>
            ) : (
              <button 
                onClick={handleGeneratePdf}
                disabled={loadingPdf}
                className="btn-primary" 
                style={{ padding: '1.25rem 3rem', fontSize: '1.15rem', borderRadius: '999px', boxShadow: '0 8px 24px rgba(245,158,11,0.2)', opacity: loadingPdf ? 0.7 : 1 }}
              >
                {loadingPdf ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <svg style={{ width: '1.15rem', height: '1.15rem', stroke: 'currentColor', strokeWidth: 2, fill: 'none', className: 'animate-spin' }} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1021 12h-1.5" />
                    </svg>
                    Generating AI Document...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <svg style={{ width: '1.15rem', height: '1.15rem', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Legal Affidavit
                  </span>
                )}
              </button>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
