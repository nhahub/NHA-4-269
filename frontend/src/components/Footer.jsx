import { Link } from 'react-router-dom';

const colTitle = { fontWeight: 700, fontSize: 14, color: '#F3E6D4', marginBottom: 12 };
const colLink = { display: 'block', cursor: 'pointer', color: '#B7AB99', fontSize: 14.5, padding: '6px 0' };

const EXPLORE = [['Search', '/search'], ['Destinations', '/destinations'], ['Deals', '/deals'], ['Reviews', '/reviews']];
const COMPANY = [['About', '/about'], ['Contact & FAQ', '/contact'], ['How it works', '/about'], ['404', '/nowhere']];
const ACCOUNT = [['Sign in', '/login'], ['Saved', '/saved'], ['My Trips', '/trips']];

export default function Footer() {
  return (
    <footer style={{ background: '#16243F', color: '#E9DECF', marginTop: 72 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 22px 26px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 30 }} className="wl-foot">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'radial-gradient(circle at 32% 30%,#BBD4F2,#2F6BE6 70%)' }} />
            <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 21, color: '#EAF1FA' }}>Wijha</span>
          </div>
          <p style={{ fontSize: 14.5, color: '#B7AB99', lineHeight: 1.6, margin: '14px 0 0', maxWidth: 260 }}>The cosy way to compare flights, stays and weather — all in one place, in your currency.</p>
          <p style={{ fontSize: 12.5, color: '#8C8071', margin: '18px 0 0' }}>Demo project · live microservices · no real bookings.</p>
        </div>
        <div>
          <div style={colTitle}>Explore</div>
          {EXPLORE.map(([l, to]) => <Link key={l} className="wl-link" to={to} style={colLink}>{l}</Link>)}
        </div>
        <div>
          <div style={colTitle}>Company</div>
          {COMPANY.map(([l, to]) => <Link key={l} className="wl-link" to={to} style={colLink}>{l}</Link>)}
        </div>
        <div>
          <div style={colTitle}>Account</div>
          {ACCOUNT.map(([l, to]) => <Link key={l} className="wl-link" to={to} style={colLink}>{l}</Link>)}
        </div>
      </div>
      <div style={{ borderTop: '1px solid #4A4036' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 13, color: '#8C8071' }}>
          <span>© 2026 Wijha. A demo by the studio.</span>
          <span>Made warm, somewhere with good coffee.</span>
        </div>
      </div>
    </footer>
  );
}
