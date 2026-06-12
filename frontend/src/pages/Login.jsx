import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('varasat_user', JSON.stringify(formData));
    navigate('/analyze');
  };

  const handleGuest = () => {
    localStorage.setItem('varasat_user', JSON.stringify({ name: 'Guest User' }));
    navigate('/analyze');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Visual Ambient Depth Orbs */}
      <div className="absolute w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none"></div>

      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md max-w-md w-full p-8 rounded-2xl shadow-2xl relative z-10 transition-all duration-300 hover:border-slate-800">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚖️</div>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome to Varasat</h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Your secure digital inheritance recovery companion.
          </p>
        </div>

        {/* Profiles Creation Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Ramesh Kumar"
              className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-semibold rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="e.g. ramesh@outlook.com"
              className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-semibold rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-semibold rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)] cursor-pointer"
          >
            Create Secure Profile
          </button>
        </form>

        {/* Divider separator */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-slate-500 text-2xs font-extrabold tracking-widest uppercase">OR</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {/* Guest access action */}
        <button 
          onClick={handleGuest} 
          className="w-full inline-flex items-center justify-center rounded-lg border border-slate-800 bg-transparent text-slate-300 font-semibold text-sm h-11 transition-all duration-200 hover:bg-slate-900/50 hover:text-white"
        >
          Continue as Guest
        </button>
        
        {/* Back Link */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-slate-500 hover:text-slate-350 text-xs font-semibold transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
