const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { register, metricsMiddleware, upstreamRequests } = require('./metrics');
const cache = require('./cache');

const SERVICE = process.env.SERVICE_NAME || 'gateway';
const PORT = process.env.PORT || 8080;

// Upstream service URLs (overridable via env for docker-compose / k8s).
const FLIGHT_URL = process.env.FLIGHT_URL || 'http://localhost:8081';
const HOTEL_URL = process.env.HOTEL_URL || 'http://localhost:8082';
const WEATHER_URL = process.env.WEATHER_URL || 'http://localhost:8083';
const CURRENCY_URL = process.env.CURRENCY_URL || 'http://localhost:8084';

const app = express();
app.use(cors());
app.use(metricsMiddleware);

const http = axios.create({ timeout: 4000 });

async function callUpstream(target, url, params) {
  try {
    const { data } = await http.get(url, { params });
    upstreamRequests.inc({ target, outcome: 'ok' });
    return { ok: true, data };
  } catch (err) {
    upstreamRequests.inc({ target, outcome: 'error' });
    return { ok: false, error: err.message };
  }
}

app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: SERVICE, cache: cache.enabled() ? 'on' : 'off' })
);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Aggregated trip search.
// GET /api/search?from=CAI&to=DXB&toCity=Dubai&date=2026-07-01&checkout=2026-07-05&currency=EGP
app.get('/api/search', async (req, res) => {
  const { from, to, toCity, date, checkout, currency } = req.query;
  if (!from || !to || !toCity) {
    return res.status(400).json({ error: 'from, to and toCity are required' });
  }

  const cacheKey = `search:${from}:${to}:${toCity}:${date}:${checkout}:${currency || 'USD'}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  // Fan out to all domain services in parallel.
  const [flights, hotels, weather, rates] = await Promise.all([
    callUpstream('flight', `${FLIGHT_URL}/flights`, { from, to, date }),
    callUpstream('hotel', `${HOTEL_URL}/hotels`, { city: toCity, checkin: date, checkout }),
    callUpstream('weather', `${WEATHER_URL}/weather`, { city: toCity }),
    callUpstream('currency', `${CURRENCY_URL}/rates`, {}),
  ]);

  const target = (currency || 'USD').toUpperCase();
  let fx = 1;
  if (rates.ok && rates.data.rates && rates.data.rates[target] && rates.data.rates.USD) {
    // rates are "to USD"; price_in_target = price_usd * (USD_to_USD / target_to_usd)
    fx = rates.data.rates.USD / rates.data.rates[target];
  }

  const response = {
    query: { from, to, toCity, date: date || null, checkout: checkout || null, currency: target },
    currencyRate: fx,
    flights: flights.ok
      ? flights.data.flights.map((f) => ({ ...f, price: Math.round(f.priceUSD * fx * 100) / 100, displayCurrency: target }))
      : { error: flights.error },
    hotels: hotels.ok
      ? hotels.data.hotels.map((h) => ({ ...h, price: Math.round(h.pricePerNightUSD * fx * 100) / 100, displayCurrency: target }))
      : { error: hotels.error },
    weather: weather.ok ? weather.data : { error: weather.error },
    cached: false,
  };

  await cache.set(cacheKey, response);
  res.json(response);
});

// Simple pass-through proxies (handy for debugging / direct service access).
app.get('/api/flights', async (req, res) => {
  const r = await callUpstream('flight', `${FLIGHT_URL}/flights`, req.query);
  res.status(r.ok ? 200 : 502).json(r.ok ? r.data : { error: r.error });
});
app.get('/api/hotels', async (req, res) => {
  const r = await callUpstream('hotel', `${HOTEL_URL}/hotels`, req.query);
  res.status(r.ok ? 200 : 502).json(r.ok ? r.data : { error: r.error });
});
app.get('/api/weather', async (req, res) => {
  const r = await callUpstream('weather', `${WEATHER_URL}/weather`, req.query);
  res.status(r.ok ? 200 : 502).json(r.ok ? r.data : { error: r.error });
});
app.get('/api/convert', async (req, res) => {
  const r = await callUpstream('currency', `${CURRENCY_URL}/convert`, req.query);
  res.status(r.ok ? 200 : 502).json(r.ok ? r.data : { error: r.error });
});

app.listen(PORT, () => console.log(`${SERVICE} listening on :${PORT}`));
