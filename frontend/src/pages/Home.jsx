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
    <div className="min-h-screen bg-white text-slate-600 font-sans antialiased flex flex-col">

      {/* ── Header / Navbar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">⚖️</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-slate-800 transition-colors">
              Varasat
            </span>
          </Link>

          {/* Live Tracker Node */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-full px-3 py-1 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-800 tracking-tight">
              Live Recovered: <span className="font-extrabold">₹42.8 Cr</span>
            </span>
          </div>

          {/* Authentication Actions */}
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/analyze" 
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Canvas ───────────────────────────────────────────────────── */}
      <main className="flex-1">

        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            
            {/* Trusted Stamp */}
            <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase mb-6">
              🏛️ Trusted Digital Inheritance Companion
            </div>

            {/* Hero Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-tight mb-6">
              Recover what your family left behind. Claim your family's{' '}
              <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                Dormant Wealth
              </span>.
            </h1>

            {/* Hero Description */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl leading-relaxed mb-8">
              Varasat uses enterprise-grade AI to discover forgotten assets, analyze inheritance claims, and securely guide Indian families through regulated legal recovery channels.
            </p>

            {/* Compliance Stamps */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-1 rounded-md tracking-tight">
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Aadhaar & DigiLocker Integrated
              </div>
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-1 rounded-md tracking-tight">
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                RBI Circular Compliant
              </div>
            </div>

            {/* Visual Storytelling Pipeline */}
            <div className="flex flex-wrap justify-center items-center gap-3 mb-10 text-xs sm:text-sm font-semibold text-slate-800">
              <div className="bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-lg shadow-2xs">📄 Unclaimed Documents</div>
              <span className="text-slate-300 font-bold hidden sm:inline">➔</span>
              <div className="bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-lg shadow-2xs">🤖 Secure AI Discovery</div>
              <span className="text-slate-300 font-bold hidden sm:inline">➔</span>
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg shadow-2xs">💰 Discovered Wealth</div>
              <span className="text-slate-300 font-bold hidden sm:inline">➔</span>
              <div className="bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-lg shadow-2xs">⚖️ Regulated Recovery</div>
            </div>

            {/* CTA Hero Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/analyze" 
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3.5 text-base font-bold text-white shadow-xs hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              >
                Start Finding Assets
              </Link>
              <Link 
                to="/demo" 
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              >
                ▶️ Try Demo Mode
              </Link>
            </div>

            {/* Voice Assistant Section */}
            <div className="mt-16 w-full max-w-xl">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Prefer speaking? Talk to Varasat AI
              </h2>
              <VoiceAssistant />
            </div>

          </div>
        </section>

        {/* ── Central Component Grid: Access Portals ──────────────────────── */}
        <section className="bg-white py-16 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-4">
                Access the Varasat Ecosystem
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Select the portal matching your role to query unclaimed assets, track family recovery progress, or verify claims.
              </p>
            </div>

            {/* Symmetric 3-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              {/* Card 1: Varasat Mitra (AI recovery) */}
              <article className="bg-slate-50 border border-slate-200/80 rounded-xl p-8 flex flex-col justify-between transition-all duration-200 hover:border-slate-300 hover:shadow-2xs">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🤖</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl tracking-tight leading-none">Varasat Mitra</h3>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mt-1.5">AI Recovery Assistant</span>
                    </div>
                  </div>
                  {/* Fixed-height wrapper for text layout alignment */}
                  <div className="h-28 flex items-center">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      A conversational AI assistant designed for claimants and local guides to search unclaimed assets, identify legal procedures, and guide them in Indian regional languages.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link 
                    to="/chat" 
                    className="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm h-11 tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <span>Start Claim</span>
                    <span className="mx-1.5 opacity-40">|</span>
                    <span className="font-medium text-[13px] leading-none tracking-normal">दावा शुरू करें</span>
                  </Link>
                </div>
              </article>

              {/* Card 2: Claimant Dashboard */}
              <article className="bg-white border-2 border-slate-300 shadow-sm rounded-xl p-8 flex flex-col justify-between transition-all duration-200 hover:shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📊</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl tracking-tight leading-none">Claimant Dashboard</h3>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mt-1.5">Asset Analytics & Tracker</span>
                    </div>
                  </div>
                  {/* Fixed-height wrapper for text layout alignment */}
                  <div className="h-28 flex items-center">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Complete tracking hub for heirs to monitor ongoing recovery operations, review automated document compilation, and calculate historical inflation loss on dormant wealth.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link 
                    to="/analytics" 
                    className="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm h-11 tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    Open Analytics Dashboard
                  </Link>
                </div>
              </article>

              {/* Card 3: Bank Partner Portal */}
              <article className="bg-slate-50 border border-slate-200/80 rounded-xl p-8 flex flex-col justify-between transition-all duration-200 hover:border-slate-300 hover:shadow-2xs">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏛️</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl tracking-tight leading-none">Bank Partner Portal</h3>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mt-1.5">Institutional Interface</span>
                    </div>
                  </div>
                  {/* Fixed-height wrapper for text layout alignment */}
                  <div className="h-28 flex items-center">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Secure access portal for regulated banks and financial institutions to verify claims, upload compliance certificates, and accelerate legacy wealth disbursements.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link 
                    to="/login" 
                    className="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm h-11 tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    Enter Bank Portal
                  </Link>
                </div>
              </article>

            </div>
          </div>
        </section>

        {/* ── Trust Section: How Varasat Helps ───────────────────────────────── */}
        <section className="bg-slate-50 py-16 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-12 tracking-tight">
              How Varasat Helps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-200/80 p-6 rounded-xl hover:border-slate-300 transition-all duration-200">
                <div className="text-3xl mb-4">🔍</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Discover</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Find possible forgotten assets scattered across banks, LIC, and mutual funds.</p>
              </div>

              <div className="bg-white border border-slate-200/80 p-6 rounded-xl hover:border-slate-300 transition-all duration-200">
                <div className="text-3xl mb-4">🧠</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Analyze</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Our AI safely understands complex documents and legally evaluates your claim eligibility.</p>
              </div>

              <div className="bg-white border border-slate-200/80 p-6 rounded-xl hover:border-slate-300 transition-all duration-200">
                <div className="text-3xl mb-4">📄</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Prepare</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Instantly generate required legal documents like Affidavits and Indemnity Bonds.</p>
              </div>

              <div className="bg-white border border-slate-200/80 p-6 rounded-xl hover:border-slate-300 transition-all duration-200">
                <div className="text-3xl mb-4">⚖️</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Recover</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Track the entire claim journey step-by-step until the family legacy is fully recovered.</p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Stats Bar ────────────────────────────────────────────────────── */}
        <section className="bg-white py-12 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { val: '₹32,000 Cr+', label: 'Unclaimed in RBI' },
                { val: '75+ Mn',       label: 'Dormant accounts' },
                { val: '5 Min',        label: 'To start claim search' },
                { val: '15+ Languages', label: 'Supported' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 hover:shadow-2xs transition-all duration-200">
                  <div className="text-2xl font-extrabold text-amber-800">{s.val}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Architecture / How it Works ──────────────────────────────────── */}
        <section className="bg-white py-16 border-t border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <HowVarasatWorks />
          </div>
        </section>

        {/* ── Step-by-Step User Flow ───────────────────────────────────────── */}
        <section className="bg-slate-50 py-16 border-t border-slate-100">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-12 tracking-tight">
              Step-by-Step User Flow
            </h2>
            <div className="space-y-4">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-4 bg-white border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 transition-all duration-200">
                  <span className="w-10 h-10 rounded-lg bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                    {s.num}
                  </span>
                  <span className="text-base font-semibold text-slate-800">{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Asset Types We Help Find ──────────────────────────────────────── */}
        <section className="bg-white py-16 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-12 tracking-tight">
              What We Help You Find
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map(f => (
                <div key={f.title} className="bg-slate-50 border border-slate-200/80 p-6 rounded-xl hover:border-slate-300 transition-all duration-200">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 text-center text-slate-500 text-sm font-medium">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
          <p>© 2026 Varasat. Made with ❤️ for Indian families.</p>
          <p className="text-xs text-slate-400">
            Aadhaar and DigiLocker names and logos are trademarks of their respective owners. Not a substitute for legal advice.
          </p>
        </div>
      </footer>

    </div>
  );
}
