import { Link } from 'react-router-dom';
import VoiceAssistant from '../components/VoiceAssistant';
import HowVarasatWorks from '../components/HowVarasatWorks';

const features = [
  { icon: '🏦', title: 'Bank Accounts',    desc: 'Find unclaimed savings, FDs, and PPF accounts.' },
  { icon: '📋', title: 'Insurance Policies', desc: 'Trace LIC and private insurance maturity claims.' },
  { icon: '📈', title: 'Shares & Bonds',   desc: 'Locate equity holdings and dividend payments.' },
  { icon: '🏛️', title: 'Provident Fund',   desc: 'Recover EPF and gratuity of the deceased.' },
];

const steps = [
  { num: '01', text: 'Tell us about your family member' },
  { num: '02', text: 'Upload documents if available'    },
  { num: '03', text: 'AI discovers possible assets'      },
  { num: '04', text: 'We guide you through legal steps'  },
  { num: '05', text: 'Claim is tracked till completion'  },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #051020 0%, #0a1628 60%, #081224 100%)', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        borderBottom: '1px solid rgba(240,192,64,0.15)',
        background: 'rgba(5,16,32,0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.6rem' }}>⚖️</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0c040', letterSpacing: '-0.5px' }}>
            Varasat
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '1rem', borderRadius: '16px' }}>
            Login
          </Link>
          <Link to="/analyze" className="btn-primary" style={{ padding: '0.6rem 1.4rem', fontSize: '1rem', borderRadius: '16px' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: '6rem 1.5rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(240,192,64,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.2rem', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: '999px', color: '#f0c040', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <span>🏛️</span> Trusted Digital Inheritance Companion
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.15, color: '#f0f4ff', marginBottom: '1.25rem' }}>
            Recover what your family <span style={{ color: '#f0c040' }}>left behind.</span>
          </h1>

          <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', color: '#a0b8d0', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Varasat uses AI to discover forgotten assets, analyze claims, and securely guide families through the legal inheritance recovery process.
          </p>

          {/* Visual Storytelling Pipeline */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '16px', fontWeight: 600, color: '#f0f4ff' }}>📄 Documents</div>
            <div style={{ color: '#f0c040', animation: 'pulse 2s infinite' }}>➔</div>
            <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '16px', fontWeight: 600, color: '#f0f4ff' }}>🤖 AI Analysis</div>
            <div style={{ color: '#f0c040', animation: 'pulse 2s infinite', animationDelay: '0.5s' }}>➔</div>
            <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '16px', fontWeight: 600, color: '#10b981' }}>💰 Hidden Assets</div>
            <div style={{ color: '#f0c040', animation: 'pulse 2s infinite', animationDelay: '1s' }}>➔</div>
            <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '16px', fontWeight: 600, color: '#f0f4ff' }}>⚖️ Claim Recovery</div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/analyze" className="btn-primary animate-fade-in-up animate-delay-1" style={{ fontSize: '1.15rem', padding: '1.2rem 2.5rem', borderRadius: '999px', boxShadow: '0 8px 24px rgba(240,192,64,0.3)' }}>
              Start Finding Assets
            </Link>
            <Link to="/demo" className="btn-secondary animate-fade-in-up animate-delay-2" style={{ fontSize: '1.15rem', padding: '1.2rem 2.5rem', borderRadius: '999px', border: '2px solid #f59e0b', color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
              ▶️ Try Demo
            </Link>
          </div>

          {/* Voice Assistant Section */}
          <div className="animate-fade-in-up animate-delay-2" style={{ marginTop: '5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#f0f4ff', marginBottom: '1.5rem', fontWeight: 700 }}>
              Prefer speaking? Talk to Varasat AI
            </h2>
            <VoiceAssistant />
          </div>

        </div>
      </section>

      {/* ── Trust Section: How Varasat Helps ───────────────────────────────── */}
      <section style={{ padding: '4rem 2rem', background: 'rgba(5,16,32,0.6)', borderTop: '1px solid rgba(240,192,64,0.1)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: '#f0f4ff', marginBottom: '3rem' }}>
            How Varasat Helps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            
            <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px', borderTop: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0f4ff', marginBottom: '0.75rem' }}>Discover</h3>
              <p style={{ color: '#8fa4c8', lineHeight: 1.6, fontSize: '0.95rem' }}>Find possible forgotten assets scattered across banks, LIC, and mutual funds.</p>
            </div>

            <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px', borderTop: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0f4ff', marginBottom: '0.75rem' }}>Analyze</h3>
              <p style={{ color: '#8fa4c8', lineHeight: 1.6, fontSize: '0.95rem' }}>Our AI safely understands complex documents and legally evaluates your claim eligibility.</p>
            </div>

            <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px', borderTop: '4px solid #f0c040' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0f4ff', marginBottom: '0.75rem' }}>Prepare</h3>
              <p style={{ color: '#8fa4c8', lineHeight: 1.6, fontSize: '0.95rem' }}>Instantly generate required legal documents like Affidavits and Indemnity Bonds.</p>
            </div>

            <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px', borderTop: '4px solid #10b981' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚖️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0f4ff', marginBottom: '0.75rem' }}>Recover</h3>
              <p style={{ color: '#8fa4c8', lineHeight: 1.6, fontSize: '0.95rem' }}>Track the entire claim journey step-by-step until the family legacy is fully recovered.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section style={{ padding: '1.5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { val: '₹32,000 Cr+', label: 'Unclaimed in RBI' },
            { val: '75+ Mn',       label: 'Dormant accounts' },
            { val: '5 Min',        label: 'To start your search' },
            { val: '15+ Languages', label: 'Supported' },
          ].map(s => (
            <div key={s.label} className="glass animate-fade-in-up"
              style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d4a017' }}>{s.val}</div>
              <div style={{ fontSize: '0.8rem', color: '#8fa4c8', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Architecture Card ───────────────────────────────────────────── */}
      <section style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <HowVarasatWorks />
      </section>

      {/* ── How it works (User Steps) ─────────────────────────────────────────────────── */}
      <section style={{ padding: '1rem 2rem 3rem', maxWidth: '850px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '2rem' }}>
          Step-by-Step User Flow
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              padding: '1rem 1.5rem',
              background: 'rgba(26,53,96,0.3)',
              border: '1px solid rgba(212,160,23,0.1)',
              borderRadius: '12px',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,160,23,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,160,23,0.1)'}
            >
              <span style={{
                minWidth: '2.5rem', height: '2.5rem',
                background: 'linear-gradient(135deg, #d4a017, #b8860b)',
                borderRadius: '8px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem',
                color: '#0f1f3d',
              }}>{s.num}</span>
              <span style={{ fontSize: '1rem', color: '#d0dcf0' }}>{s.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Asset types ──────────────────────────────────────────────────── */}
      <section style={{ padding: '2rem 2rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '2rem' }}>
          What We Help You Find
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
          {features.map(f => (
            <div key={f.title} className="glass"
              style={{ padding: '1.5rem', transition: 'transform 0.2s, border-color 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(212,160,23,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(212,160,23,0.15)'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f4ff', marginBottom: '0.4rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#8fa4c8', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(212,160,23,0.1)',
        padding: '1.5rem 2rem', textAlign: 'center',
        color: '#4a5e80', fontSize: '0.85rem',
      }}>
        © 2025 Varasat. Made with ❤️ for Indian families.
        <span style={{ margin: '0 0.75rem', opacity: 0.3 }}>|</span>
        Not a substitute for legal advice.
      </footer>
    </div>
  );
}
