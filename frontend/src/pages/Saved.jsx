import { useNavigate } from 'react-router-dom';
import ComingSoon from '../components/ComingSoon.jsx';

export default function Saved() {
  const navigate = useNavigate();
  return (
    <ComingSoon
      title="Saved & favourites"
      body="Soon you'll be able to heart any flight, stay or whole trip and find it waiting here. We're building accounts now — for the demo, everything stays comparison-only."
      cta="Browse destinations"
      onCta={() => navigate('/destinations')}
      ctaDark
    />
  );
}
