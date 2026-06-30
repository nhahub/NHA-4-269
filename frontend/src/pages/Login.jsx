import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const isSignup = mode === 'signup';
  const tab = (active) => ({ flex: 1, border: 0, padding: 10, borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer', background: active ? '#fff' : 'transparent', color: active ? '#1E54C4' : '#8597B2' });
  const field = { border: '1px solid #DCE7F4', borderRadius: 11, padding: '12px 13px', fontSize: 15, background: '#F2F7FD', color: '#8597B2' };

  return (
    <div style={{ maxWidth: 440, margin: '0 auto', padding: '52px 22px 20px' }}>
      <div style={{ background: '#fff', border: '1px solid #DCE7F4', borderRadius: 22, padding: 30, boxShadow: '0 22px 50px -34px rgba(59,50,44,.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span style={{ display: 'inline-block', width: 46, height: 46, borderRadius: '50%', background: 'radial-gradient(circle at 32% 30%,#BBD4F2,#2F6BE6 70%)' }} />
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, margin: '14px 0 0', color: '#16243F' }}>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p style={{ fontSize: 14, color: '#8597B2', margin: '6px 0 0' }}>Accounts are on the way — this screen is a preview.</p>
        </div>
        <div style={{ display: 'flex', background: '#F6F0E7', borderRadius: 12, padding: 4, marginBottom: 18 }}>
          <button onClick={() => setMode('login')} style={tab(!isSignup)}>Sign in</button>
          <button onClick={() => setMode('signup')} style={tab(isSignup)}>Create account</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isSignup && <input disabled placeholder="Full name" style={field} />}
          <input disabled placeholder="Email address" style={field} />
          <input disabled type="password" placeholder="Password" style={field} />
          <button disabled style={{ background: '#E8DDCD', color: '#8597B2', border: 0, padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'not-allowed' }}>{isSignup ? 'Create account' : 'Sign in'} — coming soon</button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#8597B2', margin: '16px 0 0' }}>No account needed to search. <a onClick={() => navigate('/search')} className="wl-link" style={{ cursor: 'pointer', color: '#2D5FB0', fontWeight: 700 }}>Skip to search →</a></p>
      </div>
    </div>
  );
}
