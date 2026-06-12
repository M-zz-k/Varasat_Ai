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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #051020 0%, #0a1628 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div className="glass animate-fade-in-up" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(240,192,64,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚖️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f0f4ff', margin: 0 }}>Welcome to Varasat</h1>
          <p style={{ color: '#8fa4c8', fontSize: '0.95rem', marginTop: '0.5rem' }}>Your trusted inheritance recovery companion.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: '#c8d8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required 
              style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#c8d8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required 
              style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#c8d8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required 
              style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }} />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '1rem', fontSize: '1.1rem', borderRadius: '16px', fontWeight: 700 }}>
            Create Secure Profile
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ color: '#8fa4c8', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button onClick={handleGuest} className="btn-secondary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '16px' }}>
          Continue as Guest
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: '#8fa4c8', fontSize: '0.9rem', textDecoration: 'none' }}>← Back to Home</Link>
        </div>

      </div>
    </div>
  );
}
