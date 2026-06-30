import { useState } from 'react';
import { useApp } from '../store.jsx';
import { FAQS } from '../data/wanderly.js';

const lbl = { fontSize: 12.5, fontWeight: 700, color: '#8597B2', textTransform: 'uppercase', letterSpacing: '.04em' };
const inp = { border: '1px solid #DCE7F4', borderRadius: 11, padding: '12px 13px', fontSize: 15, outline: 0 };

export default function Contact() {
  const { flash } = useApp();
  const [open, setOpen] = useState(0);

  const onSubmit = (e) => {
    e.preventDefault();
    flash('Thanks — message noted (demo, nothing was sent).');
    e.target.reset();
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 22px 20px', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 40, alignItems: 'start' }} className="wl-results">
      <div>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 38, letterSpacing: '-.025em', margin: 0, color: '#16243F' }}>Say hello</h1>
        <p style={{ fontSize: 17, color: '#5C6E8C', lineHeight: 1.6, margin: '12px 0 24px' }}>Questions, ideas, or just want to tell us where you're off to? Drop a line. (Demo form — nothing is actually sent.)</p>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13, background: '#fff', border: '1px solid #DCE7F4', borderRadius: 18, padding: 22 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>Name</span><input required placeholder="Your name" style={inp} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>Email</span><input required type="email" placeholder="you@example.com" style={inp} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>Message</span><textarea required rows={4} placeholder="What's on your mind?" style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} /></label>
          <button className="wl-btn" type="submit" style={{ background: '#2F6BE6', color: '#fff', border: 0, padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15.5, cursor: 'pointer' }}>Send message</button>
        </form>
      </div>
      <div>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 28, letterSpacing: '-.02em', margin: '0 0 16px', color: '#16243F' }}>Frequent questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((q, i) => {
            const isOpen = open === i;
            return (
              <div key={q.q} style={{ background: '#fff', border: '1px solid #DCE7F4', borderRadius: 14, overflow: 'hidden' }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, background: 'transparent', border: 0, padding: '17px 18px', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontWeight: 700, fontSize: 15.5, color: '#16243F' }}>{q.q}</span>
                  <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, color: '#2F6BE6', flexShrink: 0, lineHeight: 1 }}>{isOpen ? '–' : '+'}</span>
                </button>
                {isOpen && <p style={{ fontSize: 15, color: '#4A5B78', lineHeight: 1.65, margin: 0, padding: '0 18px 18px' }}>{q.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
