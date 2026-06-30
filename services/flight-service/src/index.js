const express = require('express');
const cors = require('cors');
const { register, metricsMiddleware } = require('./metrics');
const { generateFlights } = require('./data');

const SERVICE = process.env.SERVICE_NAME || 'flight-service';
const PORT = process.env.PORT || 8081;

const app = express();
app.use(cors());
app.use(metricsMiddleware);

app.get('/health', (req, res) => res.json({ status: 'ok', service: SERVICE }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// GET /flights?from=CAI&to=DXB&date=2026-07-01
app.get('/flights', (req, res) => {
  const { from, to, date } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'from and to query params are required' });
  }
  const flights = generateFlights(
    String(from).toUpperCase(),
    String(to).toUpperCase(),
    date || 'any'
  );
  res.json({ from, to, date: date || null, count: flights.length, flights });
});

app.listen(PORT, () => console.log(`${SERVICE} listening on :${PORT}`));
