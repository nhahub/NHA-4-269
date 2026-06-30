const express = require('express');
const cors = require('cors');
const { register, metricsMiddleware } = require('./metrics');
const { generateForecast } = require('./data');

const SERVICE = process.env.SERVICE_NAME || 'weather-service';
const PORT = process.env.PORT || 8083;

const app = express();
app.use(cors());
app.use(metricsMiddleware);

app.get('/health', (req, res) => res.json({ status: 'ok', service: SERVICE }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// GET /weather?city=Dubai
app.get('/weather', (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'city query param is required' });
  }
  res.json(generateForecast(String(city)));
});

app.listen(PORT, () => console.log(`${SERVICE} listening on :${PORT}`));
