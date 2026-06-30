import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { useApp } from './store.jsx';
import Home from './pages/Home.jsx';
import SearchPage from './pages/SearchPage.jsx';
import Destinations from './pages/Destinations.jsx';
import Guide from './pages/Guide.jsx';
import Deals from './pages/Deals.jsx';
import Reviews from './pages/Reviews.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Saved from './pages/Saved.jsx';
import Trips from './pages/Trips.jsx';
import NotFound from './pages/NotFound.jsx';

// Re-arms scroll-to-top + reveal-on-scroll whenever the route changes.
function useRouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch { window.scrollTo(0, 0); }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    });
    return () => { cancelAnimationFrame(id); io.disconnect(); };
  }, [pathname]);
}

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#16243F', color: '#EAF1FA', padding: '13px 22px', borderRadius: 13, fontWeight: 600, fontSize: 14.5, zIndex: 90, boxShadow: '0 16px 40px -16px rgba(0,0,0,.6)' }}>
      {toast}
    </div>
  );
}

export default function App() {
  useRouteEffects();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#EAF1FA' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:id" element={<Guide />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
