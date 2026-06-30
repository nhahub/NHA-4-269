import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import SmartImage from '../components/SmartImage.jsx';
import { DEST, CATEGORIES, STEPS, TRUST_STATS, DEALS, REVIEWS, starsText, initialsOf } from '../data/wanderly.js';

const HERO_IMG = 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1900&q=75';

export default function Home() {
  const { conv } = useApp();
  const navigate = useNavigate();
  const [country, setCountry] = useState('Switzerland');
  const [date, setDate] = useState('');

  const searchDest = (d) => navigate('/search', { state: { from: d.from, to: d.code, toCity: d.city } });
  const heroSearch = (e) => {
    e.preventDefault();
    const d = DEST.find((x) => x.country === country) || DEST[0];
    navigate('/search', { state: { from: d.from, to: d.code, toCity: d.city, date } });
  };

  const dealsTeaser = DEALS.slice(0, 3);
  const reviewsTeaser = REVIEWS.slice(0, 3);

  return (
    <div>
      {/* HERO — snowy full-bleed with glass search */}
      <section className="wl-hero" style={{ position: 'relative', minHeight: 620, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden' }}>
        <SmartImage src={HERO_IMG} seed="hero-snow" alt="Snowy getaway" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(234,241,250,.55) 0%,rgba(234,241,250,.15) 45%,rgba(220,231,244,.85) 100%)' }} />
        <div style={{ position: 'relative', textAlign: 'center', padding: '78px 22px 0', maxWidth: 920, width: '100%' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.7)', color: '#1E54C4', fontWeight: 700, fontSize: 13, padding: '7px 15px', borderRadius: 999, border: '1px solid rgba(255,255,255,.8)', backdropFilter: 'blur(8px)' }}>Flights · Hotels · Weather — one search</span>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 68, lineHeight: 1.02, letterSpacing: '-.03em', margin: '20px 0 0', color: '#1E54C4', textWrap: 'balance' }}>Where Calm<br />Meets Adventure</h1>
          <p style={{ fontSize: 18.5, lineHeight: 1.6, color: '#3A4A66', margin: '16px auto 0', maxWidth: 520, fontWeight: 500 }}>Premium snowy getaways and sunny escapes, crafted just for you.</p>

          {/* glass segmented search */}
          <form onSubmit={heroSearch} className="wl-glass wl-snowbar" style={{ margin: '34px auto 0', maxWidth: 720, display: 'flex', gap: 10, padding: 10, borderRadius: 18, boxShadow: '0 30px 60px -30px rgba(30,45,77,.5)', alignItems: 'stretch' }}>
            <label style={field}>
              <span style={fieldTop}>Country</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)} style={fieldInput}>
                {[...new Set(DEST.map((d) => d.country))].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label style={field}>
              <span style={fieldTop}>Visa type</span>
              <select style={fieldInput} defaultValue="Tourist">
                <option>Tourist</option><option>Business</option><option>Transit</option>
              </select>
            </label>
            <label style={field}>
              <span style={fieldTop}>Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={fieldInput} />
            </label>
            <button className="wl-btn" type="submit" style={{ background: '#2F6BE6', color: '#fff', border: 0, borderRadius: 13, padding: '0 30px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 24px -10px rgba(47,107,230,.9)', minHeight: 58, whiteSpace: 'nowrap' }}>Search</button>
          </form>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ borderTop: '1px solid #DDE7F3', borderBottom: '1px solid #DDE7F3', background: 'rgba(255,255,255,.5)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 22, display: 'flex', flexWrap: 'wrap', gap: 30, justifyContent: 'space-between', alignItems: 'center' }}>
          {TRUST_STATS.map((t) => (
            <div key={t.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, color: '#2F6BE6' }}>{t.num}</span>
              <span style={{ fontSize: 13.5, color: '#5C6E8C', fontWeight: 600 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SNOW DREAM CAROUSEL */}
      <SnowCarousel conv={conv} onOpen={(d) => navigate(`/destinations/${d.id}`)} onSearch={searchDest} />

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 22px 20px' }}>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 32, letterSpacing: '-.02em', margin: '0 0 30px', textAlign: 'center', color: '#16243F' }} className="reveal">How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="wl-grid3">
          {STEPS.map((s) => (
            <div key={s.n} className="reveal wl-glass" style={{ borderRadius: 18, padding: '26px 24px', border: '1px solid #DCE7F4' }}>
              <span style={{ display: 'flex', width: 46, height: 46, borderRadius: 13, background: '#E7F0FC', color: '#1E54C4', fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, alignItems: 'center', justifyContent: 'center' }}>{s.n}</span>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, margin: '16px 0 8px', color: '#16243F' }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: '#5C6E8C', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEALS TEASER */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 22px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24 }} className="reveal">
          <div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 32, letterSpacing: '-.02em', margin: 0, color: '#16243F' }}>This week's cool deals</h2>
            <p style={{ fontSize: 16.5, color: '#5C6E8C', margin: '8px 0 0' }}>Low fares we spotted on snowy and sunny routes.</p>
          </div>
          <a onClick={() => navigate('/deals')} className="wl-link" style={{ cursor: 'pointer', fontWeight: 700, color: '#2D5FB0', whiteSpace: 'nowrap' }}>All deals →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="wl-grid3">
          {dealsTeaser.map((d) => {
            const dest = DEST.find((x) => x.id === d.cityId);
            return (
              <div key={d.tc} className="wl-card" style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', minHeight: 200, cursor: 'pointer', boxShadow: '0 14px 30px -24px rgba(30,45,77,.5)' }} onClick={() => dest && searchDest(dest)}>
                <SmartImage src={d.img} seed={d.cityId} alt={d.to} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.02),rgba(16,28,52,.78))' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18, color: '#fff' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, opacity: .85, letterSpacing: '.03em' }}>{d.fc} → {d.tc} · {d.nights} nights</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 23 }}>{d.from} → {d.to}</span>
                    <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, color: '#BFE0FF' }}>{conv(d.price)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* REVIEWS TEASER */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 22px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="wl-grid3">
          {reviewsTeaser.map((r) => (
            <div key={r.name} className="reveal wl-glass" style={{ borderRadius: 18, padding: 24, border: '1px solid #DCE7F4' }}>
              <div style={{ color: '#2F6BE6', fontSize: 15, letterSpacing: 2 }}>{starsText(r.rating)}</div>
              <p style={{ fontSize: 15.5, color: '#3A4A66', lineHeight: 1.62, margin: '12px 0 16px' }}>“{r.text}”</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 38, height: 38, borderRadius: '50%', background: r.color, color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{initialsOf(r.name)}</span>
                <div><div style={{ fontWeight: 700, fontSize: 14.5, color: '#16243F' }}>{r.name}</div><div style={{ fontSize: 12.5, color: '#8597B2' }}>{r.loc}</div></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 26 }} className="reveal">
          <a onClick={() => navigate('/reviews')} className="wl-link" style={{ cursor: 'pointer', fontWeight: 700, color: '#2D5FB0' }}>Read more traveller stories →</a>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{ maxWidth: 1200, margin: '64px auto 0', padding: '0 22px' }}>
        <div className="reveal" style={{ background: 'linear-gradient(120deg,#1E54C4,#2F6BE6 55%,#6AA0E0)', borderRadius: 26, padding: '54px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 36, color: '#fff', margin: 0, letterSpacing: '-.02em' }}>Bundle up. Let's find your trip.</h2>
          <p style={{ color: '#DDEBFC', fontSize: 17.5, margin: '12px auto 24px', maxWidth: 520 }}>One route, every option, your currency. No bookings, no pressure — just a clear look.</p>
          <button className="wl-btn" onClick={() => navigate('/search')} style={{ background: '#fff', color: '#1E54C4', border: 0, padding: '15px 30px', borderRadius: 13, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Search a trip</button>
        </div>
      </section>
    </div>
  );
}

const field = { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(255,255,255,.9)', border: '1px solid #DCE7F4', borderRadius: 13, padding: '9px 14px', textAlign: 'left', minHeight: 58, justifyContent: 'center' };
const fieldTop = { fontSize: 11.5, color: '#8597B2', fontWeight: 600 };
const fieldInput = { border: 0, outline: 0, background: 'transparent', fontSize: 15, fontWeight: 700, color: '#1E2D4D', cursor: 'pointer', width: '100%' };

/* ---- "Your Snow Dream Is Here" filmstrip carousel ---- */
function SnowCarousel({ conv, onOpen, onSearch }) {
  const [cat, setCat] = useState('All');
  const [idx, setIdx] = useState(0);

  const list = useMemo(() => (cat === 'All' ? DEST : DEST.filter((d) => d.cat === cat)), [cat]);
  const n = list.length;
  const active = list[((idx % n) + n) % n];
  const move = (dir) => setIdx((i) => (((i + dir) % n) + n) % n);
  const pickCat = (c) => { setCat(c); setIdx(0); };

  // window of 5 cards centred on active
  const window5 = [-2, -1, 0, 1, 2].map((o) => list[((idx + o) % n + n) % n]);

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '70px 22px 30px' }}>
      <div style={{ textAlign: 'center' }} className="reveal">
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 38, letterSpacing: '-.02em', margin: 0, color: '#16243F' }}>Your Snow Dream Is Here</h2>
        <p style={{ fontSize: 17, color: '#5C6E8C', margin: '10px 0 0' }}>Select your favourite place, flights and hotels.</p>
      </div>

      {/* category tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, margin: '26px 0 30px' }}>
        {CATEGORIES.map((c) => {
          const on = c === cat;
          return (
            <button key={c} className="wl-tab" onClick={() => pickCat(c)} style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 15.5, fontWeight: on ? 700 : 600, color: on ? '#16243F' : '#8597B2', padding: '6px 2px', borderBottom: on ? '2px solid #2F6BE6' : '2px solid transparent' }}>{c}</button>
          );
        })}
      </div>

      {/* filmstrip */}
      <div className="wl-carousel" style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'flex-start', minHeight: 420 }}>
        {window5.map((d, i) => {
          const offset = i - 2;
          const isActive = offset === 0;
          const w = isActive ? 340 : Math.abs(offset) === 1 ? 150 : 96;
          const h = isActive ? 330 : Math.abs(offset) === 1 ? 360 : 300;
          return (
            <div key={`${d.id}-${i}`} style={{ width: w, flex: '0 0 auto', transition: 'all .4s cubic-bezier(.2,.7,.2,1)' }}>
              <div
                onClick={() => isActive ? onOpen(d) : setIdx((p) => p + offset)}
                style={{ height: h, borderRadius: 20, overflow: 'hidden', position: 'relative', cursor: 'pointer', boxShadow: isActive ? '0 26px 50px -22px rgba(30,45,77,.5)' : '0 14px 28px -20px rgba(30,45,77,.4)', opacity: Math.abs(offset) === 2 ? 0.6 : 1 }}>
                <SmartImage src={d.img} seed={d.id} alt={d.city} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {isActive && <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,.85)', color: '#1E54C4', fontWeight: 700, fontSize: 12.5, padding: '5px 11px', borderRadius: 999 }}>{d.cat} · {d.temp}°C</span>}
              </div>
              {isActive && (
                <div style={{ padding: '16px 2px 0' }}>
                  <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 25, margin: 0, color: '#16243F' }}>{d.city}</h3>
                  <p style={{ fontSize: 14.5, color: '#5C6E8C', lineHeight: 1.5, margin: '6px 0 14px', maxWidth: 340 }}>{d.country} — {d.blurb}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="wl-btn" onClick={(e) => { e.stopPropagation(); onOpen(d); }} style={{ background: '#fff', border: '1.5px solid #2F6BE6', color: '#1E54C4', padding: '11px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}>View details</button>
                    <button className="wl-btn" onClick={(e) => { e.stopPropagation(); onSearch(d); }} aria-label="Search this trip" style={{ width: 44, height: 44, borderRadius: '50%', background: '#2F6BE6', color: '#fff', border: 0, fontSize: 16, cursor: 'pointer', boxShadow: '0 10px 20px -8px rgba(47,107,230,.9)' }}>▶</button>
                    <span style={{ fontWeight: 700, color: '#2D5FB0', fontSize: 14 }}>from {conv(d.priceFrom)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* controls + progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, maxWidth: 640, margin: '26px auto 0' }}>
        <button className="wl-btn" onClick={() => move(-1)} aria-label="Previous" style={ctrlBtn}>←</button>
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: '#CFE0F5', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((((idx % n) + n) % n) + 1) / n * 100}%`, background: '#2F6BE6', borderRadius: 4, transition: 'width .4s ease' }} />
        </div>
        <button className="wl-btn" onClick={() => move(1)} aria-label="Next" style={ctrlBtn}>→</button>
      </div>
    </section>
  );
}

const ctrlBtn = { width: 46, height: 46, borderRadius: '50%', background: '#fff', border: '1.5px solid #2F6BE6', color: '#1E54C4', fontSize: 18, cursor: 'pointer', flex: '0 0 auto' };
