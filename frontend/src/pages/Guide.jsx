import { useParams, useNavigate, Link } from 'react-router-dom';
import SmartImage from '../components/SmartImage.jsx';
import { findDest, THINGS, weatherGlyph } from '../data/wanderly.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function Guide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const d = findDest(id);

  if (!d) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '70px 22px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 30, color: '#16243F' }}>No guide for that place yet</h1>
        <button className="wl-btn" onClick={() => navigate('/destinations')} style={{ marginTop: 16, background: '#1E2D4D', color: '#EAF1FA', border: 0, padding: '14px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Browse destinations</button>
      </div>
    );
  }

  const things = THINGS[d.id] || THINGS._default;
  // A light forecast around the city's typical high, for the snapshot card.
  const snapshot = DAYS.map((day, i) => {
    const hi = d.temp + [0, 1, -1, 2, -2][i];
    const cond = i === 2 ? 'Partly cloudy' : 'Sunny';
    return { d: day, hi, ...weatherGlyph(cond), c: cond };
  });
  const search = () => navigate('/search', { state: { from: d.from, to: d.code, toCity: d.city } });

  return (
    <div>
      <div style={{ height: 340, position: 'relative', background: 'linear-gradient(135deg,#CFE0F5,#1E54C4)' }}>
        <SmartImage src={d.img} seed={d.id} alt={d.city} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.05),rgba(40,28,18,.7))' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 22px 28px', color: '#fff' }}>
            <Link to="/destinations" className="wl-link" style={{ cursor: 'pointer', color: '#F3E6D4', fontWeight: 700, fontSize: 14 }}>‹ All destinations</Link>
            <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 48, letterSpacing: '-.025em', margin: '8px 0 0' }}>{d.city}</h1>
            <div style={{ fontSize: 17, fontWeight: 600, opacity: .92 }}>{d.country} · airport {d.code}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 22px 20px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 30, alignItems: 'start' }} className="wl-results">
        <div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, margin: '0 0 10px', color: '#16243F' }}>About {d.city}</h2>
          <p style={{ fontSize: 17, color: '#4A5B78', lineHeight: 1.7, margin: '0 0 28px' }}>{d.blurb} It's an easy place to fall for — warm, walkable and full of small moments worth the trip. Below are a few things travellers love, and the best window to go.</p>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 21, margin: '0 0 14px', color: '#16243F' }}>Things to do</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
            {things.map((t) => (
              <div key={t} style={{ display: 'flex', gap: 13, alignItems: 'center', padding: '15px 17px', background: '#fff', border: '1px solid #DCE7F4', borderRadius: 13 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: '#E7F0FC', color: '#1E54C4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>✦</span>
                <span style={{ fontSize: 15.5, color: '#3A4A66', fontWeight: 600 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 90 }}>
          <div style={{ background: 'linear-gradient(170deg,#FBF1DF,#EAF1FA)', border: '1px solid #F1DEBE', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, color: '#8597B2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Best time to visit</div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 24, color: '#1E54C4', margin: '6px 0 4px' }}>{d.best}</div>
            <div style={{ fontSize: 14, color: '#5C6E8C', fontWeight: 600 }}>Typical high around {d.temp}°C</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #DCE7F4', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, color: '#8597B2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Weather snapshot</div>
            {snapshot.map((w) => (
              <div key={w.d} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 2px', borderTop: '1px solid #F1E8DC' }}>
                <span style={{ width: 40, fontWeight: 700, fontSize: 14, color: '#4A5B78' }}>{w.d}</span>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: w.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{w.glyph}</span>
                <span style={{ flex: 1, fontSize: 13, color: '#5C6E8C', fontWeight: 600 }}>{w.c}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#16243F' }}>{w.hi}°</span>
              </div>
            ))}
          </div>
          <button className="wl-btn" onClick={search} style={{ background: '#2F6BE6', color: '#fff', border: 0, padding: 15, borderRadius: 13, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 12px 26px -12px rgba(217,138,94,.8)' }}>Search this trip →</button>
        </aside>
      </div>
    </div>
  );
}
