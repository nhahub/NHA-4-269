const express = require('express');
const cors = require('cors');
const { register, metricsMiddleware } = require('./metrics');
const { generateHotels } = require('./data');

const SERVICE = process.env.SERVICE_NAME || 'hotel-service';
const PORT = process.env.PORT || 8082;

const app = express();
app.use(cors());
app.use(metricsMiddleware);

app.get('/health', (req, res) => res.json({ status: 'ok', service: SERVICE }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// GET /hotels?city=Dubai&checkin=2026-07-01&checkout=2026-07-05
app.get('/hotels', (req, res) => {
  const { city, checkin, checkout } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'city query param is required' });
  }
  const hotels = generateHotels(String(city));
  res.json({
    city,
    checkin: checkin || null,
    checkout: checkout || null,
    count: hotels.length,
    hotels,
  });
});

app.listen(PORT, () => console.log(`${SERVICE} listening on :${PORT}`));
