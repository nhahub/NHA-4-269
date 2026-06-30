import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import SmartImage from '../components/SmartImage.jsx';
import { DEST } from '../data/wanderly.js';

export default function Destinations() {
  const { conv } = useApp();
  const navigate = useNavigate();
  const openGuide = (d) => navigate(`/destinations/${d.id}`);
  const search = (d) => navigate('/search', { state: { from: d.from, to: d.code, toCity: d.city } });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 22px 20px' }}>
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 40, letterSpacing: '-.025em', margin: 0, color: '#16243F' }}>Find your kind of place</h1>
      <p style={{ fontSize: 18, color: '#5C6E8C', maxWidth: 560, margin: '12px 0 30px', lineHeight: 1.6 }}>Beaches, big cities or quiet nature — open a guide to learn more, or send any place straight to search.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="wl-grid3">
        {DEST.map((d) => (
          <div key={d.id} className="wl-card" style={{ background: '#fff', border: '1px solid #DCE7F4', borderRadius: 18, overflow: 'hidden', boxShadow: '0 14px 30px -24px rgba(59,50,44,.5)' }}>
            <div style={{ height: 190, position: 'relative', background: 'linear-gradient(135deg,#CFE0F5,#2F6BE6)', cursor: 'pointer' }} onClick={() => openGuide(d)}>
              <SmartImage src={d.img} seed={d.id} alt={d.city} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,.92)', color: '#1E2D4D', fontWeight: 700, fontSize: 13, padding: '6px 11px', borderRadius: 999 }}>from {conv(d.priceFrom)}</span>
            </div>
            <div style={{ padding: '16px 17px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 21, margin: 0, color: '#16243F' }}>{d.city}</h3>
                <span style={{ fontSize: 13.5, color: '#8597B2', fontWeight: 600 }}>{d.country}</span>
              </div>
              <p style={{ fontSize: 14.5, color: '#5C6E8C', lineHeight: 1.55, margin: '8px 0 14px' }}>{d.blurb}</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="wl-btn" onClick={() => openGuide(d)} style={{ flex: 1, background: '#E7F0FC', color: '#1E54C4', border: 0, padding: 10, borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Guide</button>
                <button className="wl-btn" onClick={() => search(d)} style={{ flex: 1, background: '#1E2D4D', color: '#EAF1FA', border: 0, padding: 10, borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Search →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
