import { useState } from 'react';
import { Link } from 'react-router-dom';

const MILESTONES = [
  { id: '1', title: 'Documents Received',   desc: 'Document intelligence has successfully extracted the asset details.' },
  { id: '2', title: 'AI Verification',      desc: 'Wolfram and Claude have verified the claim eligibility and risk score.' },
  { id: '3', title: 'Claim Preparation',    desc: 'Required legal documents (Affidavit, Bond) have been generated.' },
  { id: '4', title: 'Institution Process',  desc: 'Claim submitted to the respective financial institution.' },
  { id: '5', title: 'Recovery Complete',    desc: 'The inheritance has been successfully transferred.' },
];

// Mock claims data
const MOCK_CLAIMS = [
  {
    id: 'CLM-1718091234',
    deceasedName: 'Ramesh Kumar Sharma',
    claimType: 'Fast Track Claim',
    amount: '₹2,45,000',
    institution: 'State Bank of India',
    currentStage: 1, // index into MILESTONES
  },
];

function StageRow({ stage, index, currentStage, isLast }) {
  const stageStatus =
    index < currentStage  ? 'done' :
    index === currentStage ? 'active' : 'pending';

  const colors = {
    done:    { bg: '#10b981', border: '#10b981', text: '#10b981' },
    active:  { bg: '#d4a017', border: '#d4a017', text: '#d4a017' },
    pending: { bg: 'transparent', border: 'rgba(212,160,23,0.25)', text: '#4a5e80' },
  };
  const c = colors[stageStatus];

  return (
    <div style={{ display: 'flex', gap: '1.25rem', position: 'relative' }}>
      {/* Line */}
      {!isLast && (
        <div style={{
          position: 'absolute', left: '19px', top: '44px',
          width: '2px', bottom: '-8px',
          background: index < currentStage
            ? 'linear-gradient(180deg, #10b981, rgba(16,185,129,0.3))'
            : 'rgba(212,160,23,0.1)',
        }} />
      )}

      {/* Circle */}
      <div style={{
        width: '40px', height: '40px', flexShrink: 0,
        borderRadius: '50%',
        background: stageStatus === 'pending' ? 'transparent' :
          stageStatus === 'done' ? '#10b981' : '#d4a017',
        border: `2px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: stageStatus === 'pending' ? '1rem' : '1.1rem',
        zIndex: 1,
        animation: stageStatus === 'active' ? 'pulse-glow 2s ease infinite' : 'none',
      }}>
        {stageStatus === 'done' ? '✓' : stage.id}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, paddingBottom: isLast ? 0 : '1.75rem',
        opacity: stageStatus === 'pending' ? 0.5 : 1,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: '0.25rem',
        }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: c.text }}>
            {stage.title}
          </span>
        </div>
        <p style={{ fontSize: '0.88rem', color: '#8fa4c8', margin: '0.3rem 0 0', lineHeight: 1.5 }}>
          {stage.desc}
        </p>
        {stageStatus === 'active' && (
          <div style={{
            marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0.75rem', borderRadius: '999px',
            background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.3)',
            fontSize: '0.78rem', color: '#d4a017', fontWeight: 600,
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d4a017', animation: 'pulse-glow 1.5s ease infinite' }} />
            In Progress
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a1628 0%, #0f1f3d 100%)',
    }}>

      {/* Header */}
      <header style={{
        padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem',
        background: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212,160,23,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📌</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f4ff' }}>Inheritance Recovery Journey</div>
            <div style={{ fontSize: '0.72rem', color: '#8fa4c8' }}>Track your claim status</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f0f4ff', marginBottom: '0.5rem' }}>
            Inheritance Recovery Journey
          </h1>
          <p style={{ color: '#8fa4c8', fontSize: '1rem', lineHeight: 1.6 }}>
            Follow the legal stages of recovering your family's assets.
          </p>
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', gap: '0.75rem', marginBottom: '2.5rem',
          flexWrap: 'wrap',
        }}>
          <input
            value={claimId} onChange={e => setClaimId(e.target.value)}
            placeholder="Enter Claim ID (e.g. CLM-1718091234)"
            onKeyDown={e => e.key === 'Enter' && lookupClaim()}
            style={{
              flex: 1, minWidth: '220px',
              background: 'rgba(26,53,96,0.5)', border: '1px solid rgba(212,160,23,0.2)',
              borderRadius: '10px', padding: '0.8rem 1rem',
              color: '#e8f0ff', fontSize: '0.95rem', outline: 'none',
            }}
          />
          <button onClick={lookupClaim} className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
            Search
          </button>
        </div>

        {activeClaim && (
          <>
            {/* Claim summary card */}
            <div className="glass animate-fade-in-up" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#8fa4c8', letterSpacing: '0.5px', fontWeight: 600 }}>CLAIM ID</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#d4a017' }}>{activeClaim.id}</div>
                </div>
                <div style={{
                  padding: '0.3rem 0.85rem', borderRadius: '999px',
                  background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.3)',
                  color: '#d4a017', fontSize: '0.8rem', fontWeight: 700,
                  alignSelf: 'flex-start',
                }}>{activeClaim.claimType}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Deceased',    val: activeClaim.deceasedName  },
                  { label: 'Amount',      val: activeClaim.amount        },
                  { label: 'Institution', val: activeClaim.institution   },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '0.72rem', color: '#8fa4c8', fontWeight: 600, letterSpacing: '0.5px' }}>
                      {item.label.toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 600, color: '#f0f4ff', marginTop: '0.2rem', fontSize: '0.9rem' }}>
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="glass animate-fade-in-up animate-delay-1" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '1.5rem', margin: '0 0 1.5rem' }}>
                Claim Journey
              </h2>
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

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/chat" className="btn-primary" style={{ flex: 1, textAlign: 'center', minWidth: '160px' }}>
                💬 Ask Varasat Mitra
              </Link>
              <Link to="/upload" className="btn-secondary" style={{ flex: 1, textAlign: 'center', minWidth: '160px' }}>
                📂 Upload More Docs
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
