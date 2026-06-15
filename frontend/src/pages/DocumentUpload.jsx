import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import JourneyHeader from '../components/JourneyHeader';
import Skeleton from '../components/Skeleton';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import { useDocumentAnalyzeMutation, useDocumentStatusQuery } from '../hooks/useClaimQueries';
import { useDocumentStore } from '../stores/useDocumentStore';
import { buildGraphFromExtraction } from '../services/assetApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};
const MAX_SIZE_MB = 10;

function confidenceColor(score) {
  if (score >= 80) return '#059669'; // Emerald-600
  if (score >= 50) return '#d97706'; // Amber-600
  return '#dc2626'; // Red-600
}

// ─── Clean Vector Icons Renderer ──────────────────────────────────────────────

function getSvgIcon(iconName, classes = "w-4 h-4 text-slate-500 flex-shrink-0") {
  switch (iconName) {
    case 'user':
    case 'person_name':
    case 'nominee':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    case 'bank':
    case 'institution':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3m0 0L3 9h18L12 3z" />
        </svg>
      );
    case 'money':
    case 'amount':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879-.659c1.546-1.16 3.93-1.16 5.476 0L16.25 15M9 8.818l.879.66c1.546 1.16 3.93 1.16 5.476 0L16.25 10M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />
        </svg>
      );
    case 'document':
    case 'asset_type':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case 'number':
    case 'account_number':
    case 'policy_number':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      );
    case 'calendar':
    case 'date_of_document':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008z" />
        </svg>
      );
    case 'address':
    case 'branch_address':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
      );
    case 'check':
      return (
        <svg className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'search':
      return (
        <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.028M12 20.25a8.25 8.25 0 100-16.5 8.25 8.25 0 000 16.5z" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-3m0 0a3 3 0 10-3-3m3 3a3 3 0 003-3m-3.75 9h7.5M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ value }) {
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-slate-900 rounded-full transition-all duration-300" 
        style={{ width: `${value}%` }} 
      />
    </div>
  );
}

function ConfidenceMeter({ score }) {
  const color = confidenceColor(score);
  const label = score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low';
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">AI Confidence</span>
        <span className="text-xs font-extrabold" style={{ color }}>{score}% — {label}</span>
      </div>
      <div className="h-2 bg-slate-150 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: `${score}%`, backgroundColor: color }} 
        />
      </div>
    </div>
  );
}

function DataRow({ iconKey, label, fieldKey, dataObj, onFieldChange }) {
  if (!dataObj) return null;
  
  const val = dataObj.value !== null ? dataObj.value : '';
  const conf = dataObj.confidence;

  let badgeBg = 'bg-slate-100 text-slate-500';
  if (conf !== undefined) {
    if (conf >= 0.85) badgeBg = 'bg-emerald-50 text-emerald-700 border border-emerald-250/50';
    else if (conf >= 0.70) badgeBg = 'bg-amber-50 text-amber-700 border border-amber-250/50';
    else badgeBg = 'bg-red-50 text-red-700 border border-red-250/50';
  }

  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border border-slate-200 bg-white shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">
          {label}
        </span>
        {conf !== undefined && (
          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${badgeBg}`}>
            {Math.round(conf * 100)}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <div className="mt-0.5 flex-shrink-0">
          {getSvgIcon(iconKey)}
        </div>
        <input 
          type="text"
          value={val}
          onChange={(e) => onFieldChange(fieldKey, e.target.value)}
          className="w-full text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-350 focus:border-slate-900 focus:outline-none pb-0.5 transition-colors"
        />
      </div>
    </div>
  );
}

function AIAnalysisCard({ data, file, financialInsight, onFieldChange }) {
  const score = data.confidence_score?.value ?? data.confidence_score ?? 0;
  const insKey = data.institution?.value ?? data.institution ?? '';
  const typeKey = data.asset_type?.value ?? data.asset_type ?? '';
  const todayVal = data.real_value_today?.value ?? data.real_value_today ?? 0;

  return (
    <div className="space-y-6">

      {/* Success Banner */}
      <div className="text-center p-6 bg-emerald-50 border border-emerald-100 rounded-xl">
        {getSvgIcon('check')}
        <h3 className="font-extrabold text-emerald-800 text-lg leading-tight">
          AI Analysis Complete
        </h3>
        <p className="text-xs text-emerald-600 mt-1.5 font-semibold">
          {file.originalName} · {file.size}
        </p>
      </div>

      {/* Asset Identification Card */}
      <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-xl flex items-center gap-3.5 shadow-2xs">
        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-3xs">
          {getSvgIcon('document', "w-6 h-6 text-slate-800")}
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
            Asset Category Discovered
          </span>
          <h4 className="text-sm font-black text-slate-900 mt-1 leading-tight">
            {typeKey || 'Financial Asset'}
            {insKey && ` — ${insKey}`}
          </h4>
        </div>
      </div>

      {/* Extracted Fields */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl p-5 shadow-3d-gold hover-glow-gold transition-all duration-300 relative z-10">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3 flex items-center gap-1.5">
          {getSvgIcon('search', "w-4 h-4 text-slate-800")} Extracted Claims Ledger
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DataRow iconKey="user" label="Account Holder" fieldKey="person_name" dataObj={data.person_name} onFieldChange={onFieldChange} />
          <DataRow iconKey="bank" label="Institution" fieldKey="institution" dataObj={data.institution} onFieldChange={onFieldChange} />
          <DataRow iconKey="money" label="Amount / Balance" fieldKey="amount" dataObj={data.amount} onFieldChange={onFieldChange} />
          <DataRow iconKey="document" label="Asset Type" fieldKey="asset_type" dataObj={data.asset_type} onFieldChange={onFieldChange} />
          <DataRow iconKey="number" label="Account Number" fieldKey="account_number" dataObj={data.account_number} onFieldChange={onFieldChange} />
          <DataRow iconKey="number" label="Policy Number" fieldKey="policy_number" dataObj={data.policy_number} onFieldChange={onFieldChange} />
          <DataRow iconKey="user" label="Nominee" fieldKey="nominee" dataObj={data.nominee} onFieldChange={onFieldChange} />
          <DataRow iconKey="calendar" label="Document Date" fieldKey="date_of_document" dataObj={data.date_of_document} onFieldChange={onFieldChange} />
          <DataRow iconKey="address" label="Branch Address" fieldKey="branch_address" dataObj={data.branch_address} onFieldChange={onFieldChange} />
        </div>
      </div>

      {/* Financial Valuation */}
      {(financialInsight || todayVal > 0) && (
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl p-5 shadow-3d-blue hover-glow-blue transition-all duration-300 relative z-10 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            {getSvgIcon('info', "w-4 h-4 text-slate-800")}
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider leading-none">Varasat Mitra Insight</h3>
          </div>
          {financialInsight && (
            <div className="text-xs text-slate-600 leading-relaxed font-semibold whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
              {financialInsight}
            </div>
          )}
          {todayVal > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              {getSvgIcon('lightbulb', "w-5 h-5 text-amber-500")}
              <div className="text-2xs text-slate-700 leading-relaxed font-medium">
                <span className="font-bold text-slate-900">Wolfram Computation:</span> Estimated real value today (adjusted for 6% inflation): <strong className="text-amber-800 font-extrabold">₹{todayVal.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confidence score */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl p-5 shadow-3d-gold hover-glow-gold transition-all duration-300 relative z-10">
        <ConfidenceMeter score={score} />
        {score < 60 && (
          <p className="text-2xs text-amber-700 font-semibold mt-2.5 leading-relaxed">
            Low confidence score. Make sure the uploaded file is not blurred or cropped. Try uploading a higher resolution scan.
          </p>
        )}
      </div>

      {/* CTA Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link 
          to="/chat" 
          className="flex-1 inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-11 tracking-wider transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4 mr-1.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 18.97a5.969 5.969 0 01-.774-1.902A9.26 9.26 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          Ask Varasat Mitra
        </Link>
        <Link 
          to="/asset-discovery" 
          className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs h-11 transition-all duration-200 hover:-translate-y-0.5"
        >
          View Asset Map
        </Link>
        <Link 
          to="/claim-analysis" 
          state={{ assetData: { ...Object.keys(data).reduce((acc, k) => { acc[k] = data[k]?.value ?? data[k]; return acc; }, {}), financialInsight } }} 
          className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs h-11 transition-all duration-200 hover:-translate-y-0.5"
        >
          Analyze Claim
        </Link>
      </div>

    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DocumentUpload() {
  const { t, lang, toggleLanguage } = useTranslation();
  const setOcrResults = useDocumentStore(state => state.setOcrResults);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null); 
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [error,      setError]      = useState('');

  const [jobId, setJobId] = useState(null);
  const [pollingActive, setPollingActive] = useState(false);
  const [result, setResult] = useState(null);
  const [editableFields, setEditableFields] = useState(null);

  const analyzeMutation = useDocumentAnalyzeMutation();
  const { data: jobStatus, error: jobErr } = useDocumentStatusQuery(jobId, pollingActive);

  // Monitor polling status responses
  useEffect(() => {
    if (jobStatus) {
      if (jobStatus.status === 'completed') {
        setPollingActive(false);
        setResult(jobStatus.result);
        if (jobStatus.result?.success && jobStatus.result?.data) {
          const flat = jobStatus.result.data;
          // Normalize flat API response
          const CONFIDENCE_FIELDS = [
            'person_name','institution','asset_type','account_number',
            'policy_number','amount','nominee','branch_address','date_of_document'
          ];
          const normalised = {};
          CONFIDENCE_FIELDS.forEach(key => {
            const raw = flat[key];
            if (raw !== null && raw !== undefined && typeof raw === 'object' && 'value' in raw) {
              normalised[key] = raw;
            } else {
              normalised[key] = { value: raw ?? '', confidence: flat.confidence_score ? flat.confidence_score / 100 : 0.75 };
            }
          });
          normalised.confidence_score = { value: flat.confidence_score ?? 75 };
          if (flat.real_value_today != null) {
            normalised.real_value_today = { value: flat.real_value_today };
          }
          setEditableFields(normalised);
          setOcrResults(normalised);

          // Update backend knowledge graph
          buildGraphFromExtraction('demo', flat.person_name || 'Ramesh Kumar', flat)
            .catch(err => console.error('[Polling] Failed to update backend graph:', err));
        }
      } else if (jobStatus.status === 'failed') {
        setPollingActive(false);
        setError(jobStatus.result?.error || 'Analysis job failed. Please try a cleaner scan.');
      }
    }
    if (jobErr) {
      setPollingActive(false);
      setError(jobErr.message || 'Error occurred while checking extraction status.');
    }
  }, [jobStatus, jobErr]);

  const onDrop = useCallback((acceptedFiles) => {
    const droppedFile = acceptedFiles[0];
    if (!droppedFile) return;

    if (droppedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB} MB.`);
      return;
    }

    setError('');
    setResult(null);
    setEditableFields(null);
    setProgress(0);
    setFile(droppedFile);

    if (droppedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(droppedFile);
    } else {
      setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1
  });

  const handleFieldChange = (key, value) => {
    setEditableFields(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          value: value
        }
      };
    });
  };

  const handleAnalyze = () => {
    if (!file || uploading) return;

    setUploading(true);
    setProgress(0);
    setError('');

    // Simulate visual upload progress bar over 1.5s
    let cur = 0;
    const interval = setInterval(() => {
      cur += 10;
      setProgress(Math.min(cur, 90)); // cap at 90 until response arrives
      if (cur >= 90) clearInterval(interval);
    }, 150);

    // Trigger React Query mutation to backend analyze endpoint
    analyzeMutation.mutate(file, {
      onSuccess: (data) => {
        clearInterval(interval);
        setProgress(100);
        setUploading(false);

        // Backend returns data directly (synchronous AI extraction)
        if (data.success && data.data) {
          // Normalise flat API response into {value, confidence} shape
          // that the DataRow component expects (same as demo mode format)
          const flat = data.data;
          const CONFIDENCE_FIELDS = [
            'person_name','institution','asset_type','account_number',
            'policy_number','amount','nominee','branch_address','date_of_document'
          ];
          const normalised = {};
          CONFIDENCE_FIELDS.forEach(key => {
            const raw = flat[key];
            if (raw !== null && raw !== undefined && typeof raw === 'object' && 'value' in raw) {
              // Already in {value, confidence} shape (e.g. from a future structured extractor)
              normalised[key] = raw;
            } else {
              // Flat string/number — wrap it
              normalised[key] = { value: raw ?? '', confidence: flat.confidence_score ? flat.confidence_score / 100 : 0.75 };
            }
          });
          // Preserve confidence_score and real_value_today as-is
          normalised.confidence_score = { value: flat.confidence_score ?? 75 };
          if (flat.real_value_today != null) {
            normalised.real_value_today = { value: flat.real_value_today };
          }
          setEditableFields(normalised);
          setOcrResults(normalised);

          // Update backend knowledge graph
          buildGraphFromExtraction('demo', flat.person_name || 'Ramesh Kumar', flat)
            .catch(err => console.error('[Upload] Failed to update backend graph:', err));

          setResult(data);
          setSuccess(true);
        } else if (data.jobId) {
          // Fallback: async job queue path (if backend ever adds it)
          setJobId(data.jobId);
          setPollingActive(true);
        } else {
          setError(data.error || 'Analysis returned no data. Please try again.');
        }
      },
      onError: (err) => {
        clearInterval(interval);
        setUploading(false);
        setProgress(0);
        setError(err.message || 'Analysis request failed. Please check backend connection.');
      }
    });
  };

  const runDemoMode = () => {
    setLoading(true);
    setTimeout(() => {
      const mockData = {
        person_name: { value: 'Ramesh Kumar', confidence: 0.98 },
        institution: { value: 'State Bank of India', confidence: 0.95 },
        asset_type: { value: 'Bank Account', confidence: 0.98 },
        amount: { value: '8,80,000', confidence: 0.96 },
        account_number: { value: '30998877123', confidence: 0.94 },
        policy_number: { value: 'N/A', confidence: 0.88 },
        nominee: { value: 'None Registered', confidence: 0.65, needsReview: true },
        date_of_document: { value: '2019-04-12', confidence: 0.92 },
        branch_address: { value: 'New Delhi Connaught Place', confidence: 0.85 },
        confidence_score: { value: 98 }
      };
      setEditableFields(mockData);
      setOcrResults(mockData);

      // Build the graph on the backend using the mock data
      buildGraphFromExtraction('demo', 'Ramesh Kumar', {
        person_name: 'Ramesh Kumar',
        institution: 'State Bank of India',
        asset_type: 'Bank Account',
        account_number: '30998877123',
        policy_number: 'N/A',
        amount: '8,80,000',
        nominee: 'None Registered'
      }).catch(err => console.error('[Demo] Failed to update backend graph:', err));

      setLoading(false);
      setSuccess(true);
    }, 1500); 
  };

  const reset = () => {
    setFile(null); 
    setPreview(null);
    setProgress(0); 
    setResult(null);
    setEditableFields(null);
    setError(''); 
    setUploading(false); 
    setJobId(null);
    setPollingActive(false);
    setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f8fc] bg-grid-dots font-sans antialiased text-slate-600 pb-16 flex flex-col relative overflow-hidden">
      
      {/* Visual Ambient Depth Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[140px] -top-32 -left-32 pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[140px] -bottom-32 -right-32 pointer-events-none animate-pulse duration-[10s]" />

      <Navbar
        backTo="/"
        backLabel="← Home"
        subtitle="Document Intelligence Engine"
        rightSlot={
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-bold text-amber-500 hover:text-amber-400 transition-all cursor-pointer"
          >
            <svg style={{ width: '1rem', height: '1rem', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l7.5-7.5L21 21M16.5 15h3.75M3 5.25h16.5M3.75 3v15m9-15v15" />
            </svg>
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
        }
      />

      {/* Steps checklist bar */}
      <JourneyHeader currentStep={1} />

      {/* Main Container */}
      <main className="max-w-xl mx-auto w-full px-6 py-8 flex-1 relative z-10">

        {!editableFields && !success && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('upload.header')}
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
              {t('upload.desc')}
            </p>
          </div>
        )}

        {/* react-dropzone Area */}
        {!editableFields && !success && (
          <>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer shadow-3d-gold hover-glow-gold relative z-10 ${
                uploading || pollingActive
                  ? 'cursor-not-allowed border-slate-250 bg-slate-50/50' 
                  : isDragActive 
                    ? 'border-amber-500 bg-amber-50/25' 
                    : file 
                      ? 'border-emerald-500 bg-emerald-50/15' 
                      : 'border-slate-200/80 bg-white/85 backdrop-blur-md hover:border-slate-350 shadow-3d-gold hover-glow-gold'
              }`}
            >
              <input {...getInputProps()} />

              {file ? (
                /* Ready State */
                <div className="flex flex-col items-center gap-3">
                  {preview ? (
                    <img 
                      src={preview} 
                      alt="Scan thumbnail"
                      className="max-h-40 rounded-lg shadow-sm border border-slate-200 object-contain" 
                    />
                  ) : (
                    getSvgIcon('document', "w-12 h-12 text-slate-400 mb-1")
                  )}
                  <div>
                    <span className="font-bold text-slate-800 text-xs block truncate max-w-xs mx-auto">{file.name}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {(file.size / 1024).toFixed(1)} KB · {file.type === 'application/pdf' ? 'PDF' : 'Image'}
                    </span>
                  </div>
                  {!uploading && !pollingActive && (
                    <span className="inline-flex text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                      {t('upload.ready')}
                    </span>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center py-4">
                  {getSvgIcon('cloud')}
                  <h4 className="font-bold text-slate-800 text-sm">Choose File</h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Drag and drop your document here
                  </p>
                  <p className="text-slate-350 text-[10px] mt-2">
                    PDF, JPG, PNG up to {MAX_SIZE_MB}MB
                  </p>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400 italic mt-3 mb-6">
              {t('upload.disclaimer')}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold mb-4 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </span>
                <button onClick={() => setError('')} className="text-red-700 hover:text-red-650 font-bold text-sm cursor-pointer">✕</button>
              </div>
            )}

            {/* Progress bar */}
            {uploading && (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                  <span className="animate-pulse">
                    Ingesting file...
                  </span>
                  <span>{progress}%</span>
                </div>
                <ProgressBar value={progress} />
              </div>
            )}

            {/* Polling / Processing Skeleton Loader */}
            {pollingActive && (
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span className="animate-pulse">AI Ingestion is reading document...</span>
                  <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                </div>
                <Skeleton.SkeletonText lines={4} />
              </div>
            )}

            {/* Actions */}
            {file && !pollingActive && (
              <div className="flex gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={uploading}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-11 tracking-wider transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                      </svg>
                      {t('upload.analyzeBtn')}
                    </span>
                  )}
                </button>

                <button
                  onClick={reset}
                  disabled={uploading}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs h-11 px-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  ✕ {t('upload.clearBtn')}
                </button>
              </div>
            )}

            {/* Demo Button */}
            {!file && (
              <div className="text-center my-6">
                <button
                  onClick={runDemoMode}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-250 text-xs font-bold h-11 px-5 transition-all duration-200 shadow-3xs cursor-pointer"
                >
                  {loading ? t('upload.runningDemo') : t('upload.demoBtn')}
                </button>
              </div>
            )}

            {/* Ingestion Guidelines card */}
            {!file && (
              <div className="bg-white border border-slate-200 p-5 rounded-xl mt-6 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  {getSvgIcon('lightbulb')} {t('upload.guideline')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'bank', text: 'Bank Passbooks' },
                    { key: 'document', text: 'LIC Policies' },
                    { key: 'document', text: 'EPF / PPF Slips' },
                    { key: 'document', text: 'FD Certificates' },
                    { key: 'document', text: 'Death Certificates' },
                    { key: 'user', text: 'Heir nomination forms' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      {getSvgIcon(item.key, "w-3.5 h-3.5 text-slate-400")}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">
                  {t('upload.guideline.tip')}
                </div>
              </div>
            )}
          </>
        )}

        {/* Results view */}
        {editableFields && (
          <AIAnalysisCard 
            data={editableFields} 
            file={file || { originalName: 'Demo_Document.pdf', size: '1.2MB' }} 
            financialInsight={result?.financialInsight || 'No registered nominee found. Varasat recommends compiling Succession Affidavit templates immediately.'}
            onFieldChange={handleFieldChange}
          />
        )}
      </main>
    </div>
  );
}
