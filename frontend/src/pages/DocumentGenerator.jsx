import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DocumentGenerator() {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize with asset context if navigated from Claim Analysis
  const initialAssetData = location.state?.assetData || {};

  const [documentType, setDocumentType] = useState('Affidavit');
  const [formData, setFormData] = useState({
    claimantName: '',
    deceasedName: initialAssetData.personName || '',
    relation: '',
    institution: initialAssetData.institution || '',
    assetType: initialAssetData.assetType || '',
    amount: initialAssetData.amount || '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Use arraybuffer to handle the incoming PDF binary stream
      const response = await axios.post('/api/document/generate-pdf', {
        documentType,
        claimData: formData,
      }, {
        responseType: 'arraybuffer' 
      });

      // Create a Blob from the PDF Stream
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link to trigger the browser download
      const link = document.createElement('a');
      link.href = url;
      const safeType = documentType.replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `Varasat_${safeType}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Failed to generate document. Please check the AI connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0f1f3d 100%)', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '1rem 2rem', background: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,160,23,0.15)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#8fa4c8', cursor: 'pointer', fontSize: '0.95rem' }}>← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📄</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f4ff' }}>Legal Document Generator</div>
            <div style={{ fontSize: '0.72rem', color: '#8fa4c8' }}>Powered by Varasat AI</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f0f4ff', margin: '0 0 0.5rem 0' }}>
            Generate Required Documents
          </h1>
          <p style={{ color: '#8fa4c8', margin: 0 }}>
            Our AI will draft formal legal text based on your claim details.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#a7f3d0', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#10b981' }}>Your document is ready!</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>The PDF has been downloaded to your device automatically.</p>
          </div>
        )}

        <form onSubmit={handleGenerate} className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c8d8f0', fontSize: '0.9rem', fontWeight: 600 }}>Document Type</label>
            <select 
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }}
            >
              <option value="Affidavit">Affidavit</option>
              <option value="Indemnity Bond">Indemnity Bond</option>
              <option value="Claim Letter">Claim Request Letter</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c8d8f0', fontSize: '0.9rem', fontWeight: 600 }}>Claimant Name</label>
              <input type="text" name="claimantName" value={formData.claimantName} onChange={handleChange} required placeholder="Your Full Name"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c8d8f0', fontSize: '0.9rem', fontWeight: 600 }}>Relationship</label>
              <input type="text" name="relation" value={formData.relation} onChange={handleChange} required placeholder="e.g. Son, Wife"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c8d8f0', fontSize: '0.9rem', fontWeight: 600 }}>Deceased Person Name</label>
            <input type="text" name="deceasedName" value={formData.deceasedName} onChange={handleChange} required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c8d8f0', fontSize: '0.9rem', fontWeight: 600 }}>Institution</label>
              <input type="text" name="institution" value={formData.institution} onChange={handleChange} required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c8d8f0', fontSize: '0.9rem', fontWeight: 600 }}>Asset Type</label>
              <input type="text" name="assetType" value={formData.assetType} onChange={handleChange} required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c8d8f0', fontSize: '0.9rem', fontWeight: 600 }}>Amount (₹)</label>
            <input type="text" name="amount" value={formData.amount} onChange={handleChange} required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '⏳ Generating AI Document...' : '📄 Generate & Download PDF'}
          </button>
        </form>

      </main>
    </div>
  );
}
