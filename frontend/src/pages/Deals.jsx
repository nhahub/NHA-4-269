import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import SmartImage from '../components/SmartImage.jsx';
import { DEALS, DEST } from '../data/wanderly.js';

export default function Deals() {
  const { curr, conv } = useApp();
  const navigate = useNavigate();
  const open = (d) => {
    const c = DEST.find((x) => x.id === d.cityId);
    if (c) navigate('/search', { state: { from: c.from, to: c.code, toCity: c.city } });
    else navigate('/search');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 22px 20px' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E7F0FC', color: '#1E54C4', fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 999, border: '1px solid #CFE0F5' }}>Updated weekly · prices in {curr}</span>
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 40, letterSpacing: '-.025em', margin: '16px 0 0', color: '#16243F' }}>Warm deals worth a look</h1>
      <p style={{ fontSize: 18, color: '#5C6E8C', maxWidth: 560, margin: '12px 0 30px', lineHeight: 1.6 }}>Low fares we spotted on cosy routes. Tap one to drop it straight into search.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="wl-grid3">
        {DEALS.map((d) => (
          <div key={d.tc} className="wl-card" style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', minHeight: 240, cursor: 'pointer', boxShadow: '0 14px 30px -24px rgba(59,50,44,.5)' }} onClick={() => open(d)}>
            <SmartImage src={d.img} seed={d.cityId} alt={d.to} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.05),rgba(40,28,18,.8))' }} />
            <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,.92)', color: '#1E54C4', fontWeight: 700, fontSize: 12.5, padding: '5px 11px', borderRadius: 999 }}>{d.fc} → {d.tc}</div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, color: '#fff' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, opacity: .86 }}>{d.nights} nights · return</div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, margin: '2px 0 6px' }}>{d.from} → {d.to}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, opacity: .86 }}>from</span>
                <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, color: '#BFE0FF' }}>{conv(d.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
