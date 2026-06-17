import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VoiceAssistant from '../components/VoiceAssistant';
import HowVarasatWorks from '../components/HowVarasatWorks';
import ThreeDGallery from '../components/ThreeDGallery';
import { useTranslation } from '../hooks/useTranslation';

const features = [
  { iconKey: 'bank', title: 'Bank Accounts', desc: 'Find unclaimed savings, FDs, and PPF accounts.' },
  { iconKey: 'file', title: 'Insurance Policies', desc: 'Trace LIC and private insurance maturity claims.' },
  { iconKey: 'trend', title: 'Shares & Bonds', desc: 'Locate equity holdings and dividend payments.' },
  { iconKey: 'provident', title: 'Provident Fund', desc: 'Recover EPF and gratuity of the deceased.' },
];

const steps = [
  { num: '01', text: 'Tell us about your family member' },
  { num: '02', text: 'Upload documents if available' },
  { num: '03', text: 'AI discovers possible assets' },
  { num: '04', text: 'We guide you through legal steps' },
  { num: '05', text: 'Claim is tracked till completion' },
];

function getHomeSvgIcon(name, classes = "w-5 h-5 text-slate-700") {
  switch (name) {
    case 'scale':
    case 'legal':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17M4.5 9h15M6 9a6 6 0 0012 0M6 9a6 6 0 0112 0" />
        </svg>
      );
    case 'bank':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3m0 0L3 9h18L12 3z" />
        </svg>
      );
    case 'document':
    case 'file':
    case 'policy':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case 'trend':
    case 'shares':
    case 'growth':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.5 4.5 8.25-8.25M21.75 8.25H16.5V13.5" />
        </svg>
      );
    case 'institution':
    case 'provident':
    case 'pf':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3m0 0L3 9h18L12 3z" />
        </svg>
      );
    case 'user':
    case 'avatar':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    case 'search':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
        </svg>
      );
    case 'brain':
    case 'analysis':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-11.825a.9.9 0 00-.715-1.428H14.24l.813-5.096L6.072 14.475a.9.9 0 00.715 1.428H9.81z" />
        </svg>
      );
    case 'money':
    case 'wealth':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879-.659c1.546-1.16 3.93-1.16 5.476 0L16.25 15M9 8.818l.879.66c1.546 1.16 3.93 1.16 5.476 0L16.25 10M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />
        </svg>
      );
    case 'shield':
    case 'compliance':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case 'check_shield':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'robot':
    case 'ai':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6m-3 0v3m-5 3h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z" />
        </svg>
      );
    case 'chat':
      return (
        <svg className={classes} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 18.97a5.969 5.969 0 01-.774-1.902A9.26 9.26 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Home() {
  const navigate = useNavigate();
  const { t, lang, toggleLanguage } = useTranslation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('varasat_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('varasat_user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#f3f8fc] bg-grid-dots text-slate-600 font-sans antialiased flex flex-col relative overflow-hidden">
      
      {/* ── CSS Animations & Styles ────────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-0.5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.1); }
        }
      `}</style>

      {/* ── Glowing 3D Orbs / Ambient Light Blobs ───────────────────────── */}
      <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-400/20 to-blue-500/15 blur-[120px] pointer-events-none animate-pulse duration-[8s] z-0"></div>
      <div className="absolute top-[35%] right-[5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-amber-400/15 to-orange-500/10 blur-[130px] pointer-events-none animate-pulse duration-[10s] z-0"></div>
      <div className="absolute bottom-[20%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-400/15 to-purple-500/10 blur-[150px] pointer-events-none z-0"></div>

      {/* Base Canvas Texture Overlay removed as per instructions */}

      {/* ── Ambient Lighting & Golden Waves (Bottom Corners) ───────────────── */}
      <div className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none opacity-[0.45] overflow-hidden z-0">
        <div className="w-full h-full bg-gradient-to-t from-amber-500/10 to-transparent blur-2xl"></div>
        <svg className="absolute bottom-0 left-0 w-full h-48 text-amber-500/15" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
          <path d="M0,200 C100,180 150,120 200,160 C250,200 300,100 400,120" stroke="currentColor" strokeWidth="2" />
          <path d="M0,200 C80,150 140,80 200,120 C260,160 320,60 400,90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
          <path d="M0,200 C60,120 120,40 200,80 C280,120 340,30 400,50" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none opacity-[0.45] overflow-hidden z-0">
        <div className="w-full h-full bg-gradient-to-t from-amber-500/10 to-transparent blur-2xl"></div>
        <svg className="absolute bottom-0 right-0 w-full h-48 text-amber-500/15" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
          <path d="M400,200 C300,180 250,120 200,160 C150,200 100,100 0,120" stroke="currentColor" strokeWidth="2" />
          <path d="M400,200 C320,150 260,80 200,120 C140,160 80,60 0,90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
          <path d="M400,200 C340,120 280,40 200,80 C120,120 60,30 0,50" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* ── Floating Document & Asset Nodes (Depth-of-Field Blur) ─────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10">
        

        {/* Node 2: Succession Ledger (Right) */}
        <div className="absolute right-12 top-1/3 hidden lg:flex items-center gap-2.5 bg-white/75 backdrop-blur-md border border-amber-500/20 px-3.5 py-2.5 rounded-lg shadow-md animate-float-delayed blur-[0.6px]">
          {getHomeSvgIcon('file', "w-5 h-5 text-slate-500")}
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Succession Ledger</div>
            <div className="text-xs font-extrabold text-slate-800 mt-1 leading-none">active_valuation_99</div>
          </div>
        </div>

        {/* Node 3: FD Passbook (Bottom-Left) */}
        <div className="absolute left-16 bottom-[25%] hidden lg:flex items-center gap-2.5 bg-white/75 backdrop-blur-md border border-amber-500/20 px-3.5 py-2.5 rounded-lg shadow-md animate-float blur-[0.8px]">
          {getHomeSvgIcon('bank', "w-5 h-5 text-slate-500")}
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Fixed Deposit</div>
            <div className="text-xs font-extrabold text-slate-800 mt-1 leading-none">dormant_acct_sbi</div>
          </div>
        </div>

      </div>
      <header className="sticky top-0 z-40 w-full bg-[#0b1329] border-b border-slate-800 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 group relative z-10">
            <img 
              src="/images/varasat-logo.png" 
              alt="VARASAT logo" 
              className="w-8 h-8 object-contain rounded-md" 
            />
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-slate-200 transition-colors">
              VARASAT
            </span>
          </Link>

          {/* Live Pill in Navbar */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/65 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.15)] px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>{t('home.livePill')}</span>
          </div>

          {/* Authentication Actions */}
          <div className="flex items-center gap-3 relative z-10">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-300">
                  Welcome, {user.name.split(' ')[0]}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-bold text-slate-400 hover:text-white px-3 py-2 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Login
              </Link>
            )}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-bold text-amber-500 hover:text-amber-400 transition-all cursor-pointer"
            >
              <svg style={{ width: '1rem', height: '1rem', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l7.5-7.5L21 21M16.5 15h3.75M3 5.25h16.5M3.75 3v15m9-15v15" />
              </svg>
              <span>{lang === 'en' ? 'हिंदी' : lang === 'hi' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>
            <Link 
              to="/upload" 
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 text-sm font-bold shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
            >
              {t('nav.getStarted')}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Canvas ───────────────────────────────────────────────────── */}
      <main className="flex-1 relative z-10">

        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <section className="relative py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Trusted Stamp */}
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-850 border border-slate-200 text-xs font-bold px-3.5 py-1.5 rounded-full tracking-wider uppercase mb-6">
                {getHomeSvgIcon('bank', "w-4 h-4 text-slate-700")} {t('home.stamp')}
              </div>

              {/* Hero Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-800 leading-tight mb-6">
                {t('home.title')}{' '}
                <span className="bg-gradient-to-b from-amber-500 via-amber-700 to-amber-900 bg-clip-text text-transparent drop-shadow-md">
                  {t('home.accent')}
                </span>.
              </h1>

              {/* Hero Description */}
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl">
                {t('home.desc')}
              </p>

              {/* Premium Glowing Status Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
                {/* Live Pill */}
                <div className="bg-slate-950 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.25)] text-xs font-bold px-4 py-2 rounded-full tracking-wider flex items-center gap-2 uppercase">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  VARASAT INTELLIGENCE ACTIVE
                </div>
                {/* Integrated Pill */}
                <div className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-xs font-bold px-4 py-2 rounded-full tracking-wider flex items-center gap-2 uppercase">
                  {getHomeSvgIcon('compliance', "w-4 h-4 text-emerald-400")}
                  {t('home.aadhaarPill')}
                </div>
                {/* Verified Pill */}
                <div className="bg-amber-950/90 text-amber-400 border border-amber-600/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-xs font-bold px-4 py-2 rounded-full tracking-wider flex items-center gap-2 uppercase">
                  {getHomeSvgIcon('check_shield', "w-4 h-4 text-amber-400")}
                  {t('home.circularPill')}
                </div>
              </div>

              {/* Visual Storytelling Pipeline */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 mb-10 text-xs sm:text-sm font-semibold text-slate-800">
                <div className="bg-white/85 border border-slate-200/80 px-4 py-2 rounded-lg shadow-2xs flex items-center gap-1.5">
                  {getHomeSvgIcon('file', "w-4 h-4 text-slate-600")} {t('home.pipeline.docs')}
                </div>
                <span className="text-slate-300 font-bold hidden sm:inline">➔</span>
                <div className="bg-white/85 border border-slate-200/80 px-4 py-2 rounded-lg shadow-2xs flex items-center gap-1.5">
                  {getHomeSvgIcon('ai', "w-4 h-4 text-slate-600")} {t('home.pipeline.discovery')}
                </div>
                <span className="text-slate-300 font-bold hidden sm:inline">➔</span>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg shadow-2xs flex items-center gap-1.5">
                  {getHomeSvgIcon('money', "w-4 h-4 text-emerald-700")} {t('home.pipeline.wealth')}
                </div>
                <span className="text-slate-300 font-bold hidden sm:inline">➔</span>
                <div className="bg-white/85 border border-slate-200/80 px-4 py-2 rounded-lg shadow-2xs flex items-center gap-1.5">
                  {getHomeSvgIcon('scale', "w-4 h-4 text-slate-600")} {t('home.pipeline.recovery')}
                </div>
              </div>

              {/* CTA Hero Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link 
                  to="/upload" 
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3.5 text-base font-bold text-white shadow-xs hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  {t('home.cta.find')}
                </Link>
                <Link 
                  to="/demo" 
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  {t('home.cta.demo')}
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Spherical Card Gallery */}
            <div className="lg:col-span-5 w-full h-[550px] flex items-center justify-center relative select-none">
              <ThreeDGallery />
            </div>

          </div>

          {/* Voice Assistant Section (centered below the grid columns) */}
          <div className="mt-16 flex flex-col items-center justify-center text-center px-4 w-full relative z-20">
            <div className="w-full max-w-xl bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-3d-gold hover-glow-gold transition-all duration-300">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                {t('home.voice.header')}
              </h2>
              <VoiceAssistant />
            </div>
          </div>
        </section>

        {/* ── Central Component Grid: Deep Slate-Navy hardware vaults ─────── */}
        <section className="py-16 border-t border-slate-200/40 relative">
          
          {/* Background data flow trail removed as per user request */}

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-4">
                {t('home.ecosystem.title')}
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {t('home.ecosystem.desc')}
              </p>
            </div>

            {/* Symmetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative z-10 perspective-1000 preserve-3d">
              
              {/* Card 1: Varasat Mitra (AI recovery) */}
              <article className="bg-[#0b1329]/96 backdrop-blur-md border border-slate-800/60 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover-tilt shadow-3d-gold hover-glow-gold">
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    {getHomeSvgIcon('chat', "w-8 h-8 text-amber-500")}
                    <div>
                      <h3 className="font-extrabold text-white text-xl tracking-tight leading-none">Varasat Mitra</h3>
                      <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider block mt-1.5">AI Recovery Assistant</span>
                    </div>
                  </div>
                  {/* Fixed-height wrapper for text layout alignment */}
                  <div className="h-28 flex items-center">
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      A conversational AI assistant designed for claimants and local guides to search unclaimed assets, identify legal procedures, and guide them in Indian regional languages.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link 
                    to="/chat" 
                    className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)] cursor-pointer"
                  >
                    <span>Start Claim</span>
                    <span className="mx-1.5 opacity-60">|</span>
                    <span className="font-medium text-[13px] leading-none tracking-normal">दावा शुरू करें</span>
                  </Link>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-semibold">
                    <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Best for: first-time users without documents</span>
                  </p>
                </div>
              </article>

              {/* Card 2: Claimant Dashboard (Center) */}
              <article className="bg-[#0f172a] backdrop-blur-md border-2 border-amber-500/35 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover-tilt shadow-2xl hover-glow-gold relative overflow-hidden">
                
                {/* Visual Accent: Glowing gradient top border */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600"></div>

                {/* Visual Accent: Glowing node sync graphic */}
                <div className="w-full h-16 mb-4 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <svg className="w-full h-full text-teal-400" viewBox="0 0 240 80" fill="none">
                    <line x1="20" y1="40" x2="220" y2="40" stroke="rgba(45,212,191,0.08)" strokeWidth="1" />
                    <path d="M40,50 L80,30 L120,50 L160,30 L200,55" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="4 4" />
                    <circle cx="40" cy="50" r="4" fill="#2dd4bf" className="animate-pulse-ring" />
                    <circle cx="80" cy="30" r="5" fill="#2dd4bf" />
                    <circle cx="120" cy="50" r="6" fill="#f59e0b" />
                    <circle cx="160" cy="30" r="5" fill="#2dd4bf" />
                    <circle cx="200" cy="55" r="4" fill="#2dd4bf" className="animate-pulse-ring" />
                  </svg>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    {getHomeSvgIcon('trend', "w-8 h-8 text-amber-500")}
                    <div>
                      <h3 className="font-extrabold text-white text-xl tracking-tight leading-none">Claimant Dashboard</h3>
                      <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider block mt-1.5">Asset Analytics & Tracker</span>
                    </div>
                  </div>
                  {/* Fixed-height wrapper for text layout alignment */}
                  <div className="h-28 flex items-center">
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Complete tracking hub for heirs to monitor ongoing recovery operations, review automated document compilation, and calculate historical inflation loss on dormant wealth.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link 
                    to="/analytics" 
                    className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)] cursor-pointer"
                  >
                    Open My Dashboard
                  </Link>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-semibold">
                    <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Best for: users who have already started a claim</span>
                  </p>
                </div>
              </article>

              {/* Card 3: Bank Partner Portal */}
              <article className="bg-[#0b1329]/96 backdrop-blur-md border border-slate-800/60 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover-tilt shadow-3d-gold hover-glow-gold">
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    {getHomeSvgIcon('scale', "w-8 h-8 text-amber-500")}
                    <div>
                      <h3 className="font-extrabold text-white text-xl tracking-tight leading-none">Bank Partner Portal</h3>
                      <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider block mt-1.5">Institutional Interface</span>
                    </div>
                  </div>
                  {/* Fixed-height wrapper for text layout alignment */}
                  <div className="h-28 flex items-center">
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Secure access portal for regulated banks and financial institutions to verify claims, upload compliance certificates, and accelerate legacy wealth disbursements.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link 
                    to="/login?role=bank" 
                    className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)] cursor-pointer"
                  >
                    Enter Bank Portal
                  </Link>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-amber-400/80 font-semibold">
                    <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span>For banks and financial institutions only</span>
                  </p>
                </div>
              </article>

            </div>
          </div>
        </section>

        {/* ── Trust Section: How Varasat Helps ───────────────────────────────── */}
        <section className="bg-slate-50/70 py-16 border-t border-slate-200/40 relative z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-12 tracking-tight">
              How Varasat Helps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white/90 border-2 border-[#0b1329]/70 p-6 rounded-xl hover:border-[#0b1329] hover:scale-[1.02] hover-glow-blue shadow-3d-blue transition-all duration-300">
                <div className="mb-4">{getHomeSvgIcon('search', "w-8 h-8 text-[#0b1329]")}</div>
                <h3 className="font-extrabold text-[#0b1329] text-lg mb-2">Discover</h3>
                <p className="text-slate-650 text-sm leading-relaxed font-semibold">Find possible forgotten assets scattered across banks, LIC, and mutual funds.</p>
              </div>

              <div className="bg-white/90 border-2 border-[#0b1329]/70 p-6 rounded-xl hover:border-[#0b1329] hover:scale-[1.02] hover-glow-blue shadow-3d-blue transition-all duration-300">
                <div className="mb-4">{getHomeSvgIcon('brain', "w-8 h-8 text-[#0b1329]")}</div>
                <h3 className="font-extrabold text-[#0b1329] text-lg mb-2">Analyze</h3>
                <p className="text-slate-650 text-sm leading-relaxed font-semibold">Our AI safely understands complex documents and legally evaluates your claim eligibility.</p>
              </div>

              <div className="bg-white/90 border-2 border-[#0b1329]/70 p-6 rounded-xl hover:border-[#0b1329] hover:scale-[1.02] hover-glow-blue shadow-3d-blue transition-all duration-300">
                <div className="mb-4">{getHomeSvgIcon('file', "w-8 h-8 text-[#0b1329]")}</div>
                <h3 className="font-extrabold text-[#0b1329] text-lg mb-2">Prepare</h3>
                <p className="text-slate-650 text-sm leading-relaxed font-semibold">Instantly generate required legal documents like Affidavits and Indemnity Bonds.</p>
              </div>

              <div className="bg-white/90 border-2 border-[#0b1329]/70 p-6 rounded-xl hover:border-[#0b1329] hover:scale-[1.02] hover-glow-blue shadow-3d-blue transition-all duration-300">
                <div className="mb-4">{getHomeSvgIcon('scale', "w-8 h-8 text-[#0b1329]")}</div>
                <h3 className="font-extrabold text-[#0b1329] text-lg mb-2">Recover</h3>
                <p className="text-slate-650 text-sm leading-relaxed font-semibold">Track the entire claim journey step-by-step until the family legacy is fully recovered.</p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Stats Bar ────────────────────────────────────────────────────── */}
        <section className="bg-white/80 py-12 border-t border-slate-200/40 relative z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { val: '₹32,000 Cr+', label: 'Unclaimed in RBI' },
                { val: '75+ Mn',       label: 'Dormant accounts' },
                { val: '5 Min',        label: 'To start claim search' },
                { val: 'Multilingual AI', label: 'Voice-based asset explanations currently available in English and Hindi, built for future Indian language expansion.' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-6 hover:shadow-2xs transition-all duration-200">
                  <div className="text-2xl font-extrabold text-amber-800">{s.val}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Architecture / How it Works ──────────────────────────────────── */}
        <section className="bg-white/80 py-16 border-t border-slate-200/40 relative z-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <HowVarasatWorks />
          </div>
        </section>

        {/* ── Visual User Flow Diagram (Dark Blue Theme Overhaul) ──────────── */}
        <section className="bg-slate-950 py-20 border-t border-slate-900 relative overflow-hidden z-10">
          
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[10px] bg-slate-900 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest block w-fit mx-auto mb-4">
                Operational Pipeline
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl mb-4">
                The Claim Recovery Journey
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                How Varasat's automated compliance engine securely navigates from family intake to bank disbursement.
              </p>
            </div>

            {/* Grid Flow Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
              
              {/* Step 1 */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-6 relative flex flex-col justify-between items-center text-center transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_4px_20px_rgba(245,158,11,0.08)] group">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-950 shadow-md">
                  1
                </span>
                <div className="flex flex-col items-center mt-2">
                  <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 mb-4 transition-transform group-hover:scale-110 duration-300">
                    {getHomeSvgIcon('user', "w-6 h-6 text-amber-500")}
                  </div>
                  <h3 className="text-white font-extrabold text-sm tracking-tight mb-1">Family Intake</h3>
                  <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block mb-3">01. Relationship Matrix</span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Provide the relationship hierarchy of the deceased to formulate legally valid heir claims.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-6 relative flex flex-col justify-between items-center text-center transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_4px_20px_rgba(245,158,11,0.08)] group">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-950 shadow-md">
                  2
                </span>
                <div className="flex flex-col items-center mt-2">
                  <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 mb-4 transition-transform group-hover:scale-110 duration-300">
                    {getHomeSvgIcon('file', "w-6 h-6 text-amber-500")}
                  </div>
                  <h3 className="text-white font-extrabold text-sm tracking-tight mb-1">Smart Ingestion</h3>
                  <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block mb-3">02. Secure Verification</span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Upload certificates, passbooks, and policies. System processes records without third-party exposure.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-6 relative flex flex-col justify-between items-center text-center transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_4px_20px_rgba(245,158,11,0.08)] group">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-950 shadow-md">
                  3
                </span>
                <div className="flex flex-col items-center mt-2">
                  <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 mb-4 transition-transform group-hover:scale-110 duration-300">
                    {getHomeSvgIcon('brain', "w-6 h-6 text-amber-500")}
                  </div>
                  <h3 className="text-white font-extrabold text-sm tracking-tight mb-1">AI Discovery Engine</h3>
                  <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block mb-3">03. Wolfram Audit</span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Claude reasons across databases while Wolfram executes compound inflation loss modeling.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-6 relative flex flex-col justify-between items-center text-center transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_4px_20px_rgba(245,158,11,0.08)] group">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-950 shadow-md">
                  4
                </span>
                <div className="flex flex-col items-center mt-2">
                  <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 mb-4 transition-transform group-hover:scale-110 duration-300">
                    {getHomeSvgIcon('file', "w-6 h-6 text-amber-500")}
                  </div>
                  <h3 className="text-white font-extrabold text-sm tracking-tight mb-1">Legal Compilation</h3>
                  <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block mb-3">04. Automated Drafting</span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Generate succession filings, affidavits, and bank indemnity bonds in official formats.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-6 relative flex flex-col justify-between items-center text-center transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_4px_20px_rgba(245,158,11,0.08)] group">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-950 shadow-md">
                  5
                </span>
                <div className="flex flex-col items-center mt-2">
                  <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 mb-4 transition-transform group-hover:scale-110 duration-300">
                    {getHomeSvgIcon('bank', "w-6 h-6 text-amber-500")}
                  </div>
                  <h3 className="text-white font-extrabold text-sm tracking-tight mb-1">Disbursement</h3>
                  <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block mb-3">05. Bank Integration</span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Track the file state directly until the partner bank settles the unclaimed legacy wealth.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Asset Types We Help Find ──────────────────────────────────────── */}
        <section className="bg-white/80 py-16 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-12 tracking-tight">
              What We Help You Find
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map(f => (
                <div key={f.title} className="bg-slate-50/70 border border-slate-200/80 p-6 rounded-xl hover:border-slate-350 transition-all duration-200">
                  <div className="mb-4">{getHomeSvgIcon(f.iconKey, "w-8 h-8 text-slate-800")}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-50/80 border-t border-slate-200 py-8 text-center text-slate-500 text-sm font-medium relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
          <p>© 2026 Varasat. Created with care for Indian families.</p>
          <p className="text-xs text-slate-400">
            Aadhaar and DigiLocker names and logos are trademarks of their respective owners. Not a substitute for legal advice.
          </p>
        </div>
      </footer>

    </div>
  );
}
