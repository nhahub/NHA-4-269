import { useNavigate } from 'react-router-dom';
import { STEPS } from '../data/wanderly.js';

export default function About() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 22px 20px' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E6F0FC', color: '#2D5FB0', fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 999 }}>Our story</span>
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 44, letterSpacing: '-.025em', margin: '18px 0 0', color: '#16243F', textWrap: 'balance' }}>We wanted trip planning to feel like a quiet afternoon, not twenty tabs.</h1>
      <p style={{ fontSize: 18.5, color: '#4A5B78', lineHeight: 1.7, margin: '24px 0 0' }}>Wijha started with a simple frustration: comparing a trip meant one site for flights, another for hotels, a weather app, and a currency converter open just in case. By the time you'd lined it all up, the fun had drained out of it.</p>
      <p style={{ fontSize: 18.5, color: '#4A5B78', lineHeight: 1.7, margin: '18px 0 0' }}>So we built one calm place that gathers the three things that actually shape a trip — how you get there, where you stay, and what the sky is doing — and shows them together, in the currency you think in.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, margin: '38px 0' }} className="wl-grid3">
        {STEPS.map((s) => (
          <div key={s.n} style={{ background: '#fff', border: '1px solid #DCE7F4', borderRadius: 16, padding: 22 }}>
            <span style={{ display: 'flex', width: 42, height: 42, borderRadius: 12, background: '#E7F0FC', color: '#1E54C4', fontFamily: 'Poppins', fontWeight: 700, alignItems: 'center', justifyContent: 'center' }}>{s.n}</span>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, margin: '14px 0 6px', color: '#16243F' }}>{s.title}</h3>
            <p style={{ fontSize: 14.5, color: '#5C6E8C', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>
      <div style={{ background: '#16243F', borderRadius: 22, padding: 40, color: '#F3E6D4' }}>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, margin: '0 0 10px' }}>What we believe</h2>
        <p style={{ fontSize: 16.5, lineHeight: 1.7, color: '#D6C8B5', margin: 0 }}>Comparison should be honest and unhurried. No dark patterns, no fake countdowns, no inflated "was" prices. Just a clear, warm look at your options — and the room to decide in your own time. This build is a demo with mock data, but the principle is the whole point.</p>
        <button className="wl-btn" onClick={() => navigate('/search')} style={{ marginTop: 22, background: '#2F6BE6', color: '#fff', border: 0, padding: '14px 26px', borderRadius: 12, fontWeight: 700, fontSize: 15.5, cursor: 'pointer' }}>Try a search</button>
      </div>
    </div>
  );
}
