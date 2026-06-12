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
    done:    'bg-emerald-500 border-emerald-500 text-slate-950 font-bold',
    active:  'bg-slate-950 border-amber-500 text-amber-500 shadow-md shadow-amber-500/20 font-black animate-pulse',
    pending: 'bg-slate-950 border-slate-800 text-slate-600',
  };

  return (
    <div className="flex gap-4 relative">
      
      {/* Connecting Timeline Line */}
      {!isLast && (
        <div className={`absolute left-5 top-11 w-0.5 bottom-0 ${
          index < currentStage 
            ? 'bg-gradient-to-b from-emerald-500 to-emerald-500/20' 
            : 'bg-slate-800'
        }`} />
      )}

      {/* Circle Icon Indicator */}
      <div className={`w-10 h-10 rounded-full flex-shrink-0 border-2 flex items-center justify-center text-sm z-10 ${styleClasses[stageStatus]}`}>
        {stageStatus === 'done' ? '✓' : stage.id}
      </div>

      {/* Stage Detail Content */}
      <div className={`flex-1 pb-8 ${stageStatus === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
        <h4 className={`font-bold text-sm ${
          stageStatus === 'done' 
            ? 'text-emerald-400' 
            : stageStatus === 'active' 
              ? 'text-amber-500' 
              : 'text-slate-400'
        }`}>
          {stage.title}
        </h4>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
          {stage.desc}
        </p>

        {stageStatus === 'active' && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
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

  function lookupClaim() {
    const found = MOCK_CLAIMS.find(c => c.id === claimId.trim());
    if (found) setActiveClaim(found);
    else alert('Claim ID not found. Use: CLM-1718091234 for demo.');
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-300 pb-16 relative overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="text-slate-400 hover:text-white font-bold text-xs px-2.5 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-850/50 transition-all mr-2"
          >
            ← Home
          </Link>
          
          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-lg">
            📌
          </div>

          <div>
            <h1 className="font-extrabold text-white text-sm leading-none">Claim Journey Tracker</h1>
            <p className="text-[10px] text-slate-500 mt-1 font-bold">Secure operational timeline audits</p>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-xl mx-auto px-6 py-12 relative z-10">
        
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Recovery Pipeline Status
          </h2>
          <p className="text-slate-400 text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
            Verify claim milestone updates and institutional communication logs in real time.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 bg-slate-900/40 border border-slate-850 p-3 rounded-2xl">
          <input
            value={claimId} 
            onChange={e => setClaimId(e.target.value)}
            placeholder="Enter Claim ID (e.g. CLM-1718091234)"
            onKeyDown={e => e.key === 'Enter' && lookupClaim()}
            className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-white placeholder-slate-650 text-sm font-semibold outline-none focus:border-amber-500 transition-all"
          />
          <button 
            onClick={lookupClaim} 
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs h-10 px-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-sm shadow-amber-500/10"
          >
            Locate Claim
          </button>
        </div>

        {activeClaim ? (
          <div className="space-y-6">
            
            {/* Audit Summary Card */}
            <div className="bg-slate-900/60 border border-slate-850/80 backdrop-blur-md p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-6">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Claim Reference</span>
                  <span className="text-sm font-extrabold text-amber-500 mt-1 block">{activeClaim.id}</span>
                </div>
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {activeClaim.claimType}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-800/60 pt-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Deceased relative</span>
                  <span className="text-xs font-bold text-white mt-1 block truncate">{activeClaim.deceasedName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Recoverable amount</span>
                  <span className="text-xs font-bold text-white mt-1 block truncate">{activeClaim.amount}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Target Institution</span>
                  <span className="text-xs font-bold text-white mt-1 block truncate">{activeClaim.institution}</span>
                </div>
              </div>
            </div>

            {/* Audit Timeline Checklist */}
            <div className="bg-slate-900/60 border border-slate-850/80 backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-wider border-b border-slate-800/65 pb-4 mb-2">
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
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                to="/chat" 
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
              >
                💬 Ask Varasat Mitra
              </Link>
              <Link 
                to="/upload" 
                className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-800 bg-transparent hover:bg-slate-900/50 text-slate-300 font-semibold text-xs h-11 transition-all duration-200"
              >
                📂 Ingest New Documents
              </Link>
            </div>

          </div>
        ) : (
          <div className="text-center py-10 bg-slate-900/30 border border-slate-900 rounded-2xl text-slate-500 text-xs">
            No active claim located. Please input CLM-1718091234.
          </div>
        )}
      </main>

    </div>
  );
}
