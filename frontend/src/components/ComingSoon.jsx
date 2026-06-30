// Shared "accounts required — coming soon" screen for Saved & My Trips.
export default function ComingSoon({ icon, title, body, cta, onCta, ctaDark }) {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 22px', textAlign: 'center' }}>
      {icon && <span style={{ fontSize: 48 }}>{icon}</span>}
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 34, letterSpacing: '-.02em', margin: '12px 0 0', color: '#16243F' }}>{title}</h1>
      <span style={{ display: 'inline-block', margin: '14px 0', background: '#E7F0FC', color: '#1E54C4', fontWeight: 700, fontSize: 13, padding: '7px 15px', borderRadius: 999, border: '1px solid #CFE0F5' }}>Accounts required — coming soon</span>
      <p style={{ fontSize: 17, color: '#5C6E8C', lineHeight: 1.65, maxWidth: 480, margin: '8px auto 26px' }}>{body}</p>
      <button
        className="wl-btn"
        onClick={onCta}
        style={{ background: ctaDark ? '#1E2D4D' : '#2F6BE6', color: ctaDark ? '#EAF1FA' : '#fff', border: 0, padding: '14px 26px', borderRadius: 12, fontWeight: 700, fontSize: 15.5, cursor: 'pointer' }}
      >
        {cta}
      </button>
    </div>
  );
}
