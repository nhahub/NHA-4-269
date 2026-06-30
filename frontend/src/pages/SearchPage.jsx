import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../store.jsx';
import SmartImage from '../components/SmartImage.jsx';
import { searchTrip } from '../api.js';
import { airlineColor, ratingWord, weatherGlyph } from '../data/wanderly.js';

const lbl = { fontSize: 12.5, fontWeight: 700, color: '#8597B2', textTransform: 'uppercase', letterSpacing: '.04em' };
const inp = { border: '1px solid #DCE7F4', borderRadius: 11, padding: '12px 13px', fontSize: 15.5, fontWeight: 600, outline: 0 };
const fmtDur = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;
const fmtDate = (s) => { try { return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch { return s; } };
const weekday = (s) => { try { return new Date(s).toLocaleDateString('en-GB', { weekday: 'short' }); } catch { return s; } };
const nightsOf = (a, b) => { try { const n = Math.round((new Date(b) - new Date(a)) / 86400000); return n > 0 ? n : 4; } catch { return 4; } };

export default function SearchPage() {
  const { curr, fmt } = useApp();
  const location = useLocation();
  const pre = location.state || {};

  const [form, setForm] = useState({
    from: pre.from || 'CAI',
    to: pre.to || 'DXB',
    toCity: pre.toCity || 'Dubai',
    checkin: '2026-07-01',
    checkout: '2026-07-05',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null); // { type, item }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDetail(null);
    try {
      const data = await searchTrip({
        from: form.from, to: form.to, toCity: form.toCity,
        date: form.checkin, checkout: form.checkout, currency: curr,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [form, curr]);

  // Search on first load and whenever the currency changes (re-prices).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { runSearch(); }, [curr]);

  const onSubmit = (e) => { e.preventDefault(); runSearch(); };

  const flights = Array.isArray(result?.flights) ? result.flights : [];
  const hotels = Array.isArray(result?.hotels) ? result.hotels : [];
  const weather = result?.weather && !result.weather.error ? result.weather : null;
  const nights = nightsOf(form.checkin, form.checkout);
  const tripDates = `${fmtDate(form.checkin)} – ${fmtDate(form.checkout)}`;

  if (detail) {
    return <Detail detail={detail} form={form} nights={nights} fmt={fmt} onBack={() => setDetail(null)} />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 22px 20px' }}>
      {/* FORM */}
      <form onSubmit={onSubmit} style={{ background: '#fff', border: '1px solid #DCE7F4', borderRadius: 20, padding: 18, boxShadow: '0 18px 44px -30px rgba(30,45,77,.45)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr 1fr', gap: 12, alignItems: 'end' }} className="wl-form">
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>From</span><input value={form.from} onChange={set('from')} placeholder="CAI" style={{ ...inp, textTransform: 'uppercase' }} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>To</span><input value={form.to} onChange={set('to')} placeholder="DXB" style={{ ...inp, textTransform: 'uppercase' }} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>Destination city</span><input value={form.toCity} onChange={set('toCity')} placeholder="Dubai" style={inp} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>Check-in</span><input type="date" value={form.checkin} onChange={set('checkin')} style={{ ...inp, fontSize: 14.5 }} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>Check-out</span><input type="date" value={form.checkout} onChange={set('checkout')} style={{ ...inp, fontSize: 14.5 }} /></label>
        </div>
        <button className="wl-btn" type="submit" style={{ width: '100%', marginTop: 14, background: '#2F6BE6', color: '#fff', border: 0, padding: '14px 26px', borderRadius: 12, fontWeight: 700, fontSize: 15.5, cursor: 'pointer', boxShadow: '0 10px 22px -10px rgba(47,107,230,.7)' }}>Search</button>
      </form>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', margin: '26px 2px 18px' }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 28, letterSpacing: '-.02em', margin: 0, color: '#16243F' }}>{form.from} → {form.toCity}</h1>
        <span style={{ fontSize: 14.5, color: '#5C6E8C', fontWeight: 600 }}>{tripDates} · prices in {curr}</span>
        <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#2D5FB0', background: '#E6F0FC', padding: '7px 13px', borderRadius: 999 }}>Live microservices · comparison only, no bookings</span>
      </div>

      {loading && <Notice>Gathering your trip from the services…</Notice>}
      {error && <Notice bad>Couldn't reach the trip services: {error}. Is the gateway running? <a className="wl-link" style={{ cursor: 'pointer', color: '#1E54C4', fontWeight: 700 }} onClick={runSearch}>Try again</a></Notice>}

      {result && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }} className="wl-results">
          {/* LEFT */}
          <div>
            {/* FLIGHTS */}
            <section style={{ background: '#fff', border: '1px solid #DCE7F4', borderRadius: 18, padding: '20px 20px 8px', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 21, margin: 0, color: '#16243F' }}>Flights <span style={{ color: '#8597B2', fontWeight: 600, fontSize: 15 }}>· {flights.length} found</span></h2>
                <span style={{ fontSize: 13, color: '#8597B2', fontWeight: 600 }}>Sorted by price</span>
              </div>
              {flights.length === 0 && <p style={{ color: '#8597B2', padding: '12px 8px' }}>No flights returned.</p>}
              {flights.map((f) => (
                <div key={f.id} className="wl-row" onClick={() => setDetail({ type: 'flight', item: f })} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 8px', borderTop: '1px solid #F1E8DC', cursor: 'pointer', borderRadius: 10 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 10, background: airlineColor(f.airlineCode), color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.airlineCode}</span>
                  <div style={{ minWidth: 120 }}>
                    <div style={{ fontWeight: 700, fontSize: 15.5, color: '#16243F' }}>{f.departTime} → {f.arriveTime}</div>
                    <div style={{ fontSize: 13, color: '#8597B2', fontWeight: 600 }}>{f.airline}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 13.5, color: '#5C6E8C', fontWeight: 600 }}>{fmtDur(f.durationMinutes)}</div>
                    <div style={{ fontSize: 12.5, color: f.stops === 0 ? '#2D5FB0' : '#B58A4A', fontWeight: 700 }}>{f.stops === 0 ? 'Direct' : `${f.stops} stop`}</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 90 }}>
                    <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 19, color: '#1E54C4' }}>{fmt(f.price, f.displayCurrency)}</div>
                    <div style={{ fontSize: 11.5, color: '#8597B2' }}>per person</div>
                  </div>
                  <span style={{ fontSize: 18, color: '#C7B7A4' }}>›</span>
                </div>
              ))}
            </section>

            {/* HOTELS */}
            <section style={{ background: '#fff', border: '1px solid #DCE7F4', borderRadius: 18, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 21, margin: 0, color: '#16243F' }}>Stays <span style={{ color: '#8597B2', fontWeight: 600, fontSize: 15 }}>· {hotels.length} in {form.toCity}</span></h2>
                <span style={{ fontSize: 13, color: '#8597B2', fontWeight: 600 }}>{nights} nights</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {hotels.length === 0 && <p style={{ color: '#8597B2' }}>No stays returned.</p>}
                {hotels.map((h) => (
                  <div key={h.id} className="wl-card" onClick={() => setDetail({ type: 'hotel', item: h })} style={{ display: 'grid', gridTemplateColumns: '128px 1fr auto', gap: 15, border: '1px solid #F1E8DC', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}>
                    <div style={{ background: 'linear-gradient(135deg,#CFE0F5,#4F86D6)' }}>
                      <SmartImage src={`https://picsum.photos/seed/hotel-${h.id}/300/300`} seed={`hotel-${h.id}`} alt={h.name} style={{ width: 128, height: '100%', minHeight: 118, objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '14px 0' }}>
                      <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 17, color: '#16243F' }}>{h.name}</div>
                      <div style={{ fontSize: 13, color: '#3E78D6', letterSpacing: 1 }}>{'★'.repeat(h.stars)}</div>
                      <div style={{ fontSize: 13.5, color: '#8597B2', fontWeight: 600, marginTop: 4 }}>{h.city || form.toCity}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 9 }}>
                        {(h.amenities || []).slice(0, 3).map((a) => <span key={a} style={{ fontSize: 11.5, fontWeight: 600, color: '#6B5F55', background: '#F6F0E7', padding: '3px 9px', borderRadius: 999 }}>{a}</span>)}
                      </div>
                    </div>
                    <div style={{ padding: '14px 16px', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E6F0FC', color: '#2D5FB0', fontWeight: 700, fontSize: 13, padding: '4px 9px', borderRadius: 8 }}>{h.ratingOutOf10} {ratingWord(h.ratingOutOf10)}</span>
                      <div>
                        <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: '#1E54C4' }}>{fmt(h.price, h.displayCurrency)}</div>
                        <div style={{ fontSize: 11.5, color: '#8597B2' }}>per night</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: WEATHER */}
          <aside style={{ position: 'sticky', top: 90 }}>
            <section style={{ background: 'linear-gradient(170deg,#FBF1DF,#EAF1FA)', border: '1px solid #F1DEBE', borderRadius: 18, padding: 20, boxShadow: '0 14px 34px -26px rgba(59,50,44,.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 19, margin: 0, color: '#16243F' }}>Weather in {form.toCity}</h2>
                <span style={{ fontSize: 30, lineHeight: 1 }}>{weather ? weatherGlyph(weather.condition).glyph : '☀'}</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 13.5, color: '#5C6E8C', fontWeight: 600 }}>For your dates · {tripDates}</div>
              {weather ? (
                <>
                  <div style={{ margin: '16px 0', padding: 16, background: '#fff', borderRadius: 14, border: '1px solid #F1E2C9', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 44, color: '#1E54C4', lineHeight: 1 }}>{weather.forecast[0].highC}°</div>
                    <div style={{ fontSize: 14, color: '#5C6E8C', fontWeight: 600, marginTop: 2 }}>{weather.condition} · feels like {weather.forecast[0].highC + 2}°</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {weather.forecast.slice(0, 5).map((w) => {
                      const g = weatherGlyph(w.condition);
                      return (
                        <div key={w.date} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 6px', borderTop: '1px solid #F1E2C9' }}>
                          <span style={{ width: 42, fontWeight: 700, fontSize: 14, color: '#4A5B78' }}>{weekday(w.date)}</span>
                          <span style={{ width: 26, height: 26, borderRadius: 8, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{g.glyph}</span>
                          <span style={{ flex: 1, fontSize: 13.5, color: '#5C6E8C', fontWeight: 600 }}>{w.condition}</span>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#16243F' }}>{w.highC}°</span>
                          <span style={{ fontSize: 13, color: '#B3A595' }}>{w.lowC}°</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 13.5, color: '#8597B2', margin: '14px 0 0' }}>Weather is unavailable right now.</p>
              )}
              <p style={{ fontSize: 12.5, color: '#8597B2', margin: '14px 0 0', lineHeight: 1.5 }}>Pack light layers for evenings. Forecast comes from the weather service.</p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

function Notice({ children, bad }) {
  return (
    <div style={{ padding: '14px 18px', borderRadius: 14, margin: '4px 0 18px', fontWeight: 600, fontSize: 14.5, background: bad ? '#FAE3DC' : '#E6F0FC', border: `1px solid ${bad ? '#EAB6A6' : '#CFE0C6'}`, color: bad ? '#C2543F' : '#2D5FB0' }}>
      {children}
    </div>
  );
}

function Detail({ detail, form, nights, fmt, onBack }) {
  const isFlight = detail.type === 'flight';
  const it = detail.item;
  const back = (
    <a onClick={onBack} className="wl-link" style={{ cursor: 'pointer', fontWeight: 700, color: '#2D5FB0', fontSize: 14.5 }}>‹ Back to results</a>
  );

  if (isFlight) {
    const total = Number(it.price);
    const fareRows = [
      { l: 'Base fare', v: fmt(Math.round(total * 0.78), it.displayCurrency) },
      { l: 'Taxes & fees', v: fmt(Math.round(total * 0.22), it.displayCurrency) },
      { l: 'Total per person', v: fmt(total, it.displayCurrency) },
    ];
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 22px 20px' }}>
        {back}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start', marginTop: 18 }} className="wl-results">
          <div style={{ background: '#fff', border: '1px solid #DCE7F4', borderRadius: 20, padding: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 52, height: 52, borderRadius: 13, background: airlineColor(it.airlineCode), color: '#fff', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.airlineCode}</span>
              <div>
                <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, margin: 0, color: '#16243F' }}>{it.airline}</h1>
                <div style={{ fontSize: 14, color: '#8597B2', fontWeight: 600 }}>{form.from} → {form.to} · {fmtDate(form.checkin)}</div>
              </div>
            </div>
            <div style={{ margin: '26px 0', padding: 22, background: '#F2F7FD', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 30, color: '#16243F' }}>{it.departTime}</div>
                <div style={{ fontSize: 14, color: '#8597B2', fontWeight: 700 }}>{form.from}</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#5C6E8C', fontWeight: 600 }}>{fmtDur(it.durationMinutes)}</div>
                <div style={{ height: 2, background: 'repeating-linear-gradient(90deg,#A9C2E6 0 7px,transparent 7px 14px)', margin: '14px 0', position: 'relative' }} />
                <div style={{ fontSize: 12.5, color: '#2D5FB0', fontWeight: 700 }}>{it.stops === 0 ? 'Direct' : `${it.stops} stop`}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 30, color: '#16243F' }}>{it.arriveTime}</div>
                <div style={{ fontSize: 14, color: '#8597B2', fontWeight: 700 }}>{form.to}</div>
              </div>
            </div>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 17, margin: '0 0 12px', color: '#16243F' }}>What's included</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['7 kg cabin bag', '23 kg checked bag', 'Meal included', 'Changes from a fee'].map((t) => (
                <div key={t} style={{ padding: '13px 15px', background: '#F2F7FD', borderRadius: 11, fontSize: 14, color: '#4A5B78', fontWeight: 600 }}>{t}</div>
              ))}
            </div>
          </div>
          <FareAside title="Fare" rows={fareRows} price={fmt(total, it.displayCurrency)} />
        </div>
      </div>
    );
  }

  // hotel
  const per = Number(it.price);
  const tot = Math.round(per * nights);
  const fareRows = [
    { l: `${fmt(per, it.displayCurrency)} × ${nights} nights`, v: fmt(tot, it.displayCurrency) },
    { l: 'Taxes & fees', v: fmt(Math.round(tot * 0.1), it.displayCurrency) },
    { l: 'Total stay', v: fmt(Math.round(tot * 1.1), it.displayCurrency) },
  ];
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 22px 20px' }}>
      {back}
      <div style={{ marginTop: 18 }}>
        <div style={{ height: 300, borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg,#CFE0F5,#4F86D6)', position: 'relative' }}>
          <SmartImage src={`https://picsum.photos/seed/hotel-${it.id}/1000/600`} seed={`hotel-${it.id}`} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <span style={{ position: 'absolute', top: 16, right: 16, background: '#E6F0FC', color: '#2D5FB0', fontWeight: 700, fontSize: 14, padding: '7px 13px', borderRadius: 10 }}>{it.ratingOutOf10} {ratingWord(it.ratingOutOf10)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start', marginTop: 22 }} className="wl-results">
          <div style={{ background: '#fff', border: '1px solid #DCE7F4', borderRadius: 20, padding: 26 }}>
            <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 27, margin: 0, color: '#16243F' }}>{it.name}</h1>
            <div style={{ fontSize: 14, color: '#3E78D6', letterSpacing: 1, marginTop: 4 }}>{'★'.repeat(it.stars)}</div>
            <div style={{ fontSize: 14.5, color: '#8597B2', fontWeight: 600, marginTop: 6 }}>{it.city || form.toCity}</div>
            <p style={{ fontSize: 15.5, color: '#4A5B78', lineHeight: 1.65, margin: '18px 0' }}>A warm, well-placed stay for your {nights}-night trip — comfortable rooms, friendly staff and everything within easy reach. Rooms and photos are sample data for this demo.</p>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 17, margin: '0 0 12px', color: '#16243F' }}>Amenities</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(it.amenities || []).map((a) => <span key={a} style={{ fontSize: 13, fontWeight: 600, color: '#6B5F55', background: '#F6F0E7', padding: '7px 13px', borderRadius: 999 }}>{a}</span>)}
            </div>
            <div style={{ marginTop: 22, height: 160, borderRadius: 14, background: 'repeating-linear-gradient(45deg,#DDE7F3 0 12px,#F4ECE0 12px 24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A89A8A', fontFamily: 'monospace', fontSize: 13 }}>map of {it.city || form.toCity}</div>
          </div>
          <FareAside title="Your stay" rows={fareRows} price={fmt(per, it.displayCurrency)} suffix=" / night" />
        </div>
      </div>
    </div>
  );
}

function FareAside({ title, rows, price, suffix }) {
  return (
    <aside style={{ position: 'sticky', top: 90, background: '#fff', border: '1px solid #DCE7F4', borderRadius: 18, padding: 22 }}>
      <div style={{ fontSize: 13, color: '#8597B2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{title}</div>
      <div style={{ margin: '12px 0' }}>
        {rows.map((r) => (
          <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid #F1E8DC', fontSize: 14.5, color: '#4A5B78', fontWeight: 600 }}>
            <span>{r.l}</span><span style={{ color: '#16243F' }}>{r.v}</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 24, color: '#1E54C4' }}>{price}{suffix && <span style={{ fontSize: 13, color: '#8597B2', fontWeight: 600 }}>{suffix}</span>}</div>
      <button disabled style={{ width: '100%', marginTop: 14, background: '#E8DDCD', color: '#8597B2', border: 0, padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'not-allowed' }}>Booking — coming soon</button>
      <p style={{ fontSize: 12.5, color: '#8597B2', textAlign: 'center', margin: '10px 0 0' }}>Wijha compares only. No bookings in this demo.</p>
    </aside>
  );
}
