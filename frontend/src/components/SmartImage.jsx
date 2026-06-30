import { useState } from 'react';

// Loads a real photo; on failure falls back to a deterministic picsum image so
// the UI never shows a broken-image icon. `style`/`className` pass through.
export default function SmartImage({ src, seed, alt, className, style }) {
  const [failed, setFailed] = useState(false);
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(seed || alt || 'wanderly')}/900/600`;
  return (
    <img
      className={className}
      style={style}
      src={failed ? fallback : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
