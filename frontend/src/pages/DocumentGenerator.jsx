import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DOC_TYPES = [
  { value: 'Affidavit',       label: 'Affidavit' },
  { value: 'Indemnity Bond',  label: 'Indemnity Bond' },
  { value: 'Claim Letter',    label: 'Claim Request Letter' },
];

// Inline SVG icons
const IconDoc = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconDownload = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

export default function DocumentGenerator() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialAssetData = location.state?.assetData || {};

  const [documentType, setDocumentType] = useState('Affidavit');
  const [formData, setFormData] = useState({
    claimantName:  '',
    deceasedName:  initialAssetData.person_name || initialAssetData.personName || '',
    relation:      '',
    institution:   initialAssetData.institution || '',
    assetType:     initialAssetData.asset_type  || initialAssetData.assetType  || '',
    amount:        initialAssetData.amount       || '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post(
        '/api/document/generate-pdf',
        { documentType, claimData: formData },
        { responseType: 'arraybuffer' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `Varasat_${documentType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
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

  const inputClass =
    'w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 outline-none focus:border-slate-600 transition-all';

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-300">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-3.5 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white font-bold text-xs px-2.5 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-800/50 transition-all cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back
        </button>

        <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
          <IconDoc />
        </div>
        <div>
          <div className="font-extrabold text-white text-sm leading-none">Legal Document Generator</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">Powered by Varasat AI</div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">Generate Required Documents</h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            Our AI will draft formal legal text based on your claim details.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-950/30 border border-red-800/50 rounded-xl mb-5 text-red-400 text-xs font-semibold">
            <IconAlert />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex flex-col items-center gap-2 p-5 bg-emerald-950/20 border border-emerald-700/30 rounded-2xl mb-5 text-center">
            <IconCheck />
            <h3 className="text-emerald-400 font-bold text-base">Your document is ready!</h3>
            <p className="text-slate-400 text-xs">The PDF has been downloaded to your device automatically.</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleGenerate}
          className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-4"
        >
          {/* Document Type */}
          <FormField label="Document Type">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className={inputClass + ' cursor-pointer'}
            >
              {DOC_TYPES.map(dt => (
                <option key={dt.value} value={dt.value} className="bg-slate-950">{dt.label}</option>
              ))}
            </select>
          </FormField>

          {/* Name grid */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Claimant Name">
              <input
                type="text"
                name="claimantName"
                value={formData.claimantName}
                onChange={handleChange}
                required
                placeholder="Your Full Name"
                className={inputClass}
              />
            </FormField>
            <FormField label="Relationship">
              <input
                type="text"
                name="relation"
                value={formData.relation}
                onChange={handleChange}
                required
                placeholder="e.g. Son, Wife"
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField label="Deceased Person Name">
            <input
              type="text"
              name="deceasedName"
              value={formData.deceasedName}
              onChange={handleChange}
              required
              placeholder="Full legal name"
              className={inputClass}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Institution">
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                required
                placeholder="e.g. SBI, LIC"
                className={inputClass}
              />
            </FormField>
            <FormField label="Asset Type">
              <input
                type="text"
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                required
                placeholder="e.g. Bank Account"
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField label="Amount (₹)">
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="e.g. 5,00,000"
              className={inputClass}
            />
          </FormField>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold text-sm h-11 tracking-wide transition-all duration-200 hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating AI Document…
              </>
            ) : (
              <>
                <IconDownload />
                Generate &amp; Download PDF
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
