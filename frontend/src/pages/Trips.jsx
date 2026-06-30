import { useNavigate } from 'react-router-dom';
import ComingSoon from '../components/ComingSoon.jsx';

export default function Trips() {
  const navigate = useNavigate();
  return (
    <ComingSoon
      title="My trips"
      body="Your planned trips — flights, stays and forecast together — will live here once accounts arrive. Until then, plan freely without signing in."
      cta="Plan a trip"
      onCta={() => navigate('/search')}
    />
  );
}
