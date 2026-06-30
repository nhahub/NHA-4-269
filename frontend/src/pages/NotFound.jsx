import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '70px 22px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 88, color: '#2F6BE6', lineHeight: 1, letterSpacing: '-.03em' }}>404</div>
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 30, margin: '10px 0 0', color: '#16243F' }}>This path wandered off</h1>
      <p style={{ fontSize: 17, color: '#5C6E8C', lineHeight: 1.65, maxWidth: 420, margin: '12px auto 26px' }}>We couldn't find that page — maybe it took an earlier flight. Let's get you back to somewhere warm.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="wl-btn" onClick={() => navigate('/')} style={{ background: '#1E2D4D', color: '#EAF1FA', border: 0, padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Back home</button>
        <button className="wl-btn" onClick={() => navigate('/search')} style={{ background: '#fff', border: '1px solid #DCE7F4', color: '#1E2D4D', padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Start a search</button>
      </div>
    </div>
  );
}
