import { REVIEWS, starsText, initialsOf } from '../data/wanderly.js';

export default function Reviews() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 22px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 30 }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 40, letterSpacing: '-.025em', margin: 0, color: '#16243F' }}>Traveller stories</h1>
          <p style={{ fontSize: 18, color: '#5C6E8C', maxWidth: 520, margin: '12px 0 0', lineHeight: 1.6 }}>Real-feeling words from people who planned with Wijha. (Testimonials are sample content for this demo.)</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'center', background: '#fff', border: '1px solid #DCE7F4', borderRadius: 16, padding: '18px 26px' }}>
          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 38, color: '#1E54C4', lineHeight: 1 }}>4.8</div>
          <div style={{ color: '#3E78D6', letterSpacing: 2, fontSize: 14 }}>★★★★★</div>
          <div style={{ fontSize: 12.5, color: '#8597B2', fontWeight: 600, marginTop: 2 }}>from 1,200+ trips</div>
        </div>
      </div>
      <div style={{ columns: 3, columnGap: 22 }} className="wl-masonry">
        {REVIEWS.map((r) => (
          <div key={r.name} style={{ breakInside: 'avoid', marginBottom: 22, background: '#fff', border: '1px solid #DCE7F4', borderRadius: 18, padding: 24 }}>
            <div style={{ color: '#3E78D6', fontSize: 15, letterSpacing: 2 }}>{starsText(r.rating)}</div>
            <p style={{ fontSize: 15.5, color: '#3A4A66', lineHeight: 1.62, margin: '12px 0 16px' }}>“{r.text}”</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: r.color, color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{initialsOf(r.name)}</span>
              <div><div style={{ fontWeight: 700, fontSize: 14.5, color: '#16243F' }}>{r.name}</div><div style={{ fontSize: 12.5, color: '#8597B2' }}>{r.loc}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
