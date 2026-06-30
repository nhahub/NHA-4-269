import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { CURLIST } from '../data/wanderly.js';

const linkStyle = { cursor: 'pointer', padding: '8px 13px', fontWeight: 600, fontSize: 15, color: '#3A4A66', borderRadius: 10 };

const MOBILE = [
  ['Search', '/search'], ['Destinations', '/destinations'], ['Deals', '/deals'],
  ['Reviews', '/reviews'], ['About', '/about'], ['Contact', '/contact'], ['Sign in', '/login'],
];

export default function Navbar() {
  const { curr, setCurr } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const goMobile = (to) => { setOpen(false); navigate(to); };

  return (
    <header className="wl-glass" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(234,241,250,.7)', borderBottom: '1px solid rgba(220,231,244,.9)' }}>
      <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <span style={{ width: 34, height: 34, borderRadius: 11, background: 'linear-gradient(150deg,#4F86D6,#2F6BE6 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -4px rgba(47,107,230,.7)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="6" y="2.5" width="12" height="19" rx="6" fill="rgba(255,255,255,.22)" stroke="#fff" strokeWidth="1.8" />
              <rect x="8.6" y="5.2" width="6.8" height="13.6" rx="3.4" fill="#BFE0FF" />
              <circle cx="14.4" cy="8.6" r="1.5" fill="#fff" />
              <path d="M8.9 16.4q1.6-2.2 3.1 0 1.5-2.2 3.1 0v2.4H8.9z" fill="#fff" opacity=".85" />
            </svg>
          </span>
          <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 23, letterSpacing: '-.02em', color: '#1E2D4D' }}>Wijha</span>
        </Link>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="wl-navlinks">
          <Link className="wl-link" to="/search" style={linkStyle}>Search</Link>
          <Link className="wl-link" to="/destinations" style={linkStyle}>Destinations</Link>
          <Link className="wl-link" to="/deals" style={linkStyle}>Deals</Link>
          <Link className="wl-link" to="/reviews" style={linkStyle}>Reviews</Link>
          <Link className="wl-link" to="/about" style={linkStyle}>About</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.7)', border: '1px solid #DCE7F4', borderRadius: 11, padding: '3px 4px 3px 11px' }}>
          <span style={{ fontSize: 12, color: '#8597B2', fontWeight: 600 }}>FX</span>
          <select value={curr} onChange={(e) => setCurr(e.target.value)} aria-label="Currency" style={{ border: 0, background: 'transparent', fontWeight: 700, fontSize: 14, color: '#1E2D4D', padding: '5px 4px', cursor: 'pointer', borderRadius: 8 }}>
            {CURLIST.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>
        <button className="wl-btn" onClick={() => navigate('/login')} style={{ background: '#2F6BE6', color: '#fff', border: 0, padding: '10px 18px', borderRadius: 11, fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 8px 18px -8px rgba(47,107,230,.8)' }}>Sign in</button>
        <button className="wl-btn wl-burger" onClick={() => setOpen((v) => !v)} aria-label="Menu" style={{ background: 'rgba(255,255,255,.7)', border: '1px solid #DCE7F4', borderRadius: 10, padding: '9px 11px', cursor: 'pointer', fontSize: 16 }}>≡</button>
      </nav>
      {open && (
        <div style={{ borderTop: '1px solid #DCE7F4', background: 'rgba(234,241,250,.95)', padding: '8px 22px 16px' }}>
          {MOBILE.map(([label, to]) => (
            <a key={to} onClick={() => goMobile(to)} style={{ display: 'block', padding: '12px 6px', fontWeight: 600, fontSize: 16, color: '#1E2D4D', cursor: 'pointer', borderBottom: '1px solid #DDE7F3' }}>{label}</a>
          ))}
        </div>
      )}
    </header>
  );
}
