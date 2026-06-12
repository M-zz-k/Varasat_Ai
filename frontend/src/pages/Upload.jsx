import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { uploadDocument } from '../services/api';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

function FileIcon({ type }) {
  if (type === 'application/pdf') return <span style={{ fontSize: '2.5rem' }}>📄</span>;
  return <span style={{ fontSize: '2.5rem' }}>🖼️</span>;
}

function ProgressBar({ value }) {
  return (
    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${value}%`,
        background: 'linear-gradient(90deg, #d4a017, #f0c040)',
        borderRadius: '3px',
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
}

export default function Upload() {
  const [dragging,  setDragging]  = useState(false);
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [progress,  setProgress]  = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Only PDF, JPG, and PNG files are allowed.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setError('');
    setResult(null);
    setProgress(0);
    setFile(f);

    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const data = await uploadDocument(file, setProgress);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Make sure the backend is running.');
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setFile(null); setPreview(null);
    setProgress(0); setResult(null); setError('');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a1628 0%, #0f1f3d 100%)',
      padding: '0',
    }}>

      {/* Header */}
      <div style={{
        padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem',
        background: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212,160,23,0.12)',
      }}>
        <Link to="/" style={{ color: '#8fa4c8', textDecoration: 'none', fontSize: '0.9rem' }}>← Back</Link>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f0f4ff' }}>
          📂 Upload Documents
        </span>
      </div>

      <div style={{ maxWidth: '650px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Drop zone */}
        {!result && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById('fileInput').click()}
              style={{
                border: `2px dashed ${dragging ? '#d4a017' : 'rgba(212,160,23,0.3)'}`,
                borderRadius: '20px',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'rgba(212,160,23,0.06)' : 'rgba(26,53,96,0.25)',
                transition: 'all 0.2s ease',
                marginBottom: '1.5rem',
              }}
            >
              <input
                id="fileInput" type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />

              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  {preview
                    ? <img src={preview} alt="preview" style={{ maxHeight: '180px', borderRadius: '10px', objectFit: 'contain' }} />
                    : <FileIcon type={file.type} />
                  }
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: '#f0f4ff' }}>{file.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#8fa4c8' }}>
                    {(file.size / 1024).toFixed(1)} KB · {file.type}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>☁️</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f0f4ff', marginBottom: '0.4rem' }}>
                    Drag & drop or click to upload
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#8fa4c8' }}>PDF, JPG, PNG · Max 10 MB</div>
                  <div style={{ fontSize: '0.8rem', color: '#5a7a9a', marginTop: '0.5rem' }}>
                    Bank statement, insurance policy, death certificate, passbook photo
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                padding: '0.85rem 1.1rem', borderRadius: '10px',
                background: 'rgba(220,50,50,0.12)', border: '1px solid rgba(220,50,50,0.3)',
                color: '#f87171', fontSize: '0.9rem', marginBottom: '1rem',
              }}>⚠️ {error}</div>
            )}

            {file && (
              <div>
                {uploading && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#8fa4c8', marginBottom: '0.4rem' }}>
                      Uploading… {progress}%
                    </div>
                    <ProgressBar value={progress} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={handleUpload} disabled={uploading} className="btn-primary"
                    style={{ flex: 1 }}>
                    {uploading ? '⏳ Uploading…' : '⬆️ Upload Document'}
                  </button>
                  <button onClick={reset} className="btn-secondary"
                    style={{ padding: '0.875rem 1.25rem' }}>
                    ✕ Clear
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Success result */}
        {result && (
          <div className="glass animate-fade-in-up" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem' }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#10b981', marginTop: '0.5rem' }}>
                Uploaded Successfully
              </div>
              <div style={{ fontSize: '0.9rem', color: '#8fa4c8', marginTop: '0.25rem' }}>
                {result.file.originalName} · {result.file.size}
              </div>
            </div>

            <div style={{
              background: 'rgba(10,22,40,0.5)', borderRadius: '12px',
              padding: '1rem', marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.8rem', color: '#8fa4c8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                EXTRACTED DATA (MOCK — REAL OCR IN PHASE 2)
              </div>
              <pre style={{ fontSize: '0.8rem', color: '#a0b8d0', overflow: 'auto', margin: 0 }}>
                {JSON.stringify(result.extracted, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/chat" className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                💬 Discuss with Mitra
              </Link>
              <button onClick={reset} className="btn-secondary">Upload Another</button>
            </div>
          </div>
        )}

        {/* Tips */}
        {!result && (
          <div className="glass" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
            <div style={{ fontWeight: 600, color: '#d4a017', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              💡 What to Upload
            </div>
            {[
              'Death certificate of the deceased',
              'Bank passbook or account statement',
              'Insurance policy document',
              'Any asset-related paper with names and amounts',
            ].map(tip => (
              <div key={tip} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#8fa4c8' }}>
                <span style={{ color: '#10b981' }}>✓</span> {tip}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
