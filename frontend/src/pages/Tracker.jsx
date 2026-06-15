import { useState } from 'react';
import { Link } from 'react-router-dom';

const MILESTONES = [
  { id: '1', title: 'Documents Received',   desc: 'Document intelligence has successfully extracted the asset details.' },
  { id: '2', title: 'AI Verification',      desc: 'Wolfram and Claude have verified the claim eligibility and risk score.' },
  { id: '3', title: 'Claim Preparation',    desc: 'Required legal documents (Affidavit, Bond) have been generated.' },
  { id: '4', title: 'Institution Process',  desc: 'Claim submitted to the respective financial institution.' },
  { id: '5', title: 'Recovery Complete',    desc: 'The inheritance has been successfully transferred.' },
];

const MOCK_CLAIMS = [
  {
    id: 'CLM-1718091234',
    deceasedName: 'Ramesh Kumar Sharma',
    claimType: 'Fast Track Claim',
    amount: '₹2,45,000',
    institution: 'State Bank of India',
    currentStage: 1, 
  },
];

function StageRow({ stage, index, currentStage, isLast }) {
  const stageStatus =
    index < currentStage  ? 'done' :
    index === currentStage ? 'active' : 'pending';

  const styleClasses = {
    done:    'bg-emerald-100 border-emerald-300 text-emerald-700 font-bold shadow-sm',
    active:  'bg-amber-100 border-amber-400 text-amber-700 shadow-sm font-black',
    pending: 'bg-slate-50 border-slate-200 text-slate-400',
  };

  return (
    <div className="flex gap-4 relative">
      
      {/* Connecting Timeline Line */}
      {!isLast && (
        <div className={`absolute left-5 top-11 w-0.5 bottom-0 ${
          index < currentStage 
            ? 'bg-emerald-500' 
            : 'bg-slate-200'
        }`} />
      )}

      {/* Circle Icon Indicator */}
      <div className={`w-10 h-10 rounded-full flex-shrink-0 border-2 flex items-center justify-center text-sm z-10 ${styleClasses[stageStatus]}`}>
        {stageStatus === 'done' ? '✓' : stage.id}
      </div>

      {/* Stage Detail Content */}
      <div className={`flex-1 pb-8 ${stageStatus === 'pending' ? 'opacity-50' : 'opacity-100'}`}>
        <h4 className={`font-bold text-sm ${
          stageStatus === 'done' 
            ? 'text-emerald-700' 
            : stageStatus === 'active' 
              ? 'text-amber-700' 
              : 'text-slate-500'
        }`}>
          {stage.title}
        </h4>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed font-medium">
          {stage.desc}
        </p>

        {stageStatus === 'active' && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Active Evaluation
          </div>
        )}
      </div>

    </div>
  );
}

export default function Tracker() {
  const [claimId, setClaimId] = useState('');
  const [activeClaim, setActiveClaim] = useState(MOCK_CLAIMS[0]);
  const [error, setError] = useState('');

  function lookupClaim() {
    const found = MOCK_CLAIMS.find(c => c.id === claimId.trim());
    if (found) {
      setActiveClaim(found);
      setError('');
    } else {
      setError('Claim ID not found. Use: CLM-1718091234 for demo.');
      setActiveClaim(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f8fc] bg-grid-dots font-sans antialiased text-slate-700 pb-16 relative overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none animate-pulse duration-[8s]"></div>
      <div className="absolute w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none animate-pulse duration-[10s]"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0b1329] border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="text-slate-200 hover:text-white font-bold text-xs px-2.5 py-1.5 border border-slate-700 bg-slate-900/60 hover:bg-slate-800/85 rounded-lg shadow-sm transition-all mr-2"
          >
            ← Home
          </Link>
          
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shadow-sm">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </div>

          <div>
            <h1 className="font-extrabold text-white text-sm leading-none">Claim Journey Tracker</h1>
            <p className="text-[10px] text-slate-400 mt-1 font-bold">Secure operational timeline audits</p>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-xl mx-auto px-6 py-12 relative z-10">
        
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Recovery Pipeline Status
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
            Verify claim milestone updates and institutional communication logs in real time.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 bg-white/85 backdrop-blur-md border border-slate-200/80 p-3 rounded-2xl shadow-3d-gold hover-glow-gold transition-all duration-300 relative z-10">
          <input
            value={claimId} 
            onChange={e => {
              setClaimId(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter Claim ID (e.g. CLM-1718091234)"
            onKeyDown={e => e.key === 'Enter' && lookupClaim()}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all shadow-sm"
          />
          <button 
            onClick={lookupClaim} 
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs h-10 px-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-md shadow-amber-500/10"
          >
            Locate Claim
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 shadow-sm animate-shake">
            <svg style={{ width: '1rem', height: '1rem', flexShrink: 0, stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {activeClaim ? (
          <div className="space-y-6">
            
            {/* Audit Summary Card */}
            <div className="bg-white/85 backdrop-blur-md border border-slate-200/80 p-6 rounded-2xl shadow-3d-blue hover-glow-blue transition-all duration-300 relative z-10">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-6">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Claim Reference</span>
                  <span className="text-sm font-extrabold text-amber-600 mt-1 block">{activeClaim.id}</span>
                </div>
                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {activeClaim.claimType}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Deceased relative</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block truncate">{activeClaim.deceasedName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Recoverable amount</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block truncate">{activeClaim.amount}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Target Institution</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block truncate">{activeClaim.institution}</span>
                </div>
              </div>
            </div>

            {/* Audit Timeline Checklist */}
            <div className="bg-white/85 backdrop-blur-md border border-slate-200/80 p-6 rounded-2xl shadow-3d-gold hover-glow-gold transition-all duration-300 space-y-6 relative z-10">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase tracking-wider border-b border-slate-100 pb-4 mb-2">
                Verification Ledger
              </h3>
              <div className="space-y-0">
                {MILESTONES.map((stage, i) => (
                  <StageRow
                    key={stage.id}
                    stage={stage}
                    index={i}
                    currentStage={activeClaim.currentStage}
                    isLast={i === MILESTONES.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
              <Link 
                to="/chat" 
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] shadow-md shadow-amber-500/10"
              >
                Ask Varasat Mitra
              </Link>
              <Link 
                to="/upload" 
                className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs h-11 transition-all duration-200 shadow-sm"
              >
                Ingest New Documents
              </Link>
            </div>

          </div>
        ) : (
          <div className="text-center py-10 bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-2xl text-slate-500 text-xs shadow-3d-blue hover-glow-blue transition-all duration-300 relative z-10">
            No active claim located. Please input CLM-1718091234.
          </div>
        )}
      </main>

    </div>
  );
}
