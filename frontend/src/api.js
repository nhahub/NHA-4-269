// All calls go to the gateway via the same origin (/api proxied in dev and nginx).
const BASE = import.meta.env.VITE_API_BASE || '/api';

export async function searchTrip(params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/search?${qs}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Search failed (${res.status})`);
  }
  return res.json();
}
