import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isBank = searchParams.get('role') === 'bank';
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [accordionOpen, setAccordionOpen] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = (e) => {
    e.preventDefault();
    // Move to step 2 OTP entry
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === '123456' || otp === '123') { // Support 123456 or 123 for local testing convenience
      localStorage.setItem('varasat_user', JSON.stringify(formData));
      if (isBank) {
        navigate('/bank-portal');
      } else {
        navigate('/upload');
      }
    } else {
      setOtpError(t('login.otpError'));
    }
  };

  const handleGuest = () => {
    localStorage.setItem('varasat_user', JSON.stringify({ name: isBank ? 'Bank Officer' : 'Guest User' }));
    if (isBank) {
      navigate('/bank-portal');
    } else {
      navigate('/upload');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f8fc] bg-grid-dots flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Visual Ambient Depth Orbs */}
      <div className="absolute w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none animate-pulse duration-[8s]"></div>
      <div className="absolute w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none animate-pulse duration-[10s]"></div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 max-w-md w-full p-8 rounded-2xl shadow-3d-gold hover-glow-gold transition-all duration-300 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            {isBank ? (
              <div className="w-12 h-12 rounded-full bg-white border border-amber-400 flex items-center justify-center text-amber-600 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3m0 0L3 9h18L12 3zM3 21h18" />
                </svg>
              </div>
            ) : (
              <img
                src="/images/varasat-logo.png"
                alt="VARASAT logo"
                loading="eager"
                style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '12px' }}
              />
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isBank ? 'Bank & Institution Login' : t('login.title')}
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Bank-specific info box */}
        {isBank && (
          <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3.5 shadow-sm">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-0.5">Institutional Access</p>
              <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                This portal is for verified financial institutions partnering with Varasat.
              </p>
            </div>
          </div>
        )}

        {/* Accordion Checklist */}
        <div className="mb-6 border border-slate-200 bg-slate-50/50 rounded-xl overflow-hidden shadow-2xs">
          <button 
            type="button"
            onClick={() => setAccordionOpen(!accordionOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-slate-700 hover:text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>{t('login.checklist.header')}</span>
            <svg 
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${accordionOpen ? 'transform rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <div className={`transition-all duration-300 ease-in-out ${accordionOpen ? 'max-h-60 border-t border-slate-200 p-4 bg-white' : 'max-h-0 overflow-hidden'}`}>
            <ul className="space-y-2.5 text-xs text-slate-600 font-semibold">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('login.checklist.aadhaar')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('login.checklist.nominee')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('login.checklist.docs')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Form area with smooth step transitions */}
        <div className="relative overflow-hidden min-h-[300px]">
          {/* Step 1: User details */}
          <div className={`transition-all duration-300 ease-in-out ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute pointer-events-none w-full'}`}>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  {t('login.name')}
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-semibold rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  {t('login.email')}
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. ramesh@outlook.com"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-semibold rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  {t('login.phone')}
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-semibold rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all shadow-sm"
                />
              </div>

              <button 
                type="submit" 
                className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] shadow-md shadow-amber-500/10 cursor-pointer"
              >
                {t('login.submit')}
              </button>
            </form>
          </div>

          {/* Step 2: OTP Entry */}
          <div className={`transition-all duration-300 ease-in-out ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute pointer-events-none w-full'}`}>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-slate-700 leading-relaxed font-semibold">
                {t('login.otpSent')} <br/>
                <span className="text-amber-750 font-bold">Use test code: 123456</span>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  {t('login.otpLabel')}
                </label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                  maxLength={6}
                  placeholder="e.g. 123456"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-center tracking-widest text-lg font-bold rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all shadow-sm"
                />
              </div>

              {otpError && (
                <div className="text-red-600 text-xs font-semibold">
                  {otpError}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs h-11 transition-all duration-200 hover:bg-slate-50 shadow-sm"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  {t('login.verifyBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Divider separator */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-slate-400 text-2xs font-extrabold tracking-widest uppercase">{t('login.or')}</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Guest access action */}
        <button 
          onClick={handleGuest} 
          className="w-full inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-sm h-11 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm cursor-pointer"
        >
          {t('login.guest')}
        </button>
        
        {/* Back Link */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-slate-500 hover:text-slate-700 text-xs font-semibold transition-colors"
          >
            {t('login.back')}
          </Link>
        </div>

      </div>
    </div>
  );
}
