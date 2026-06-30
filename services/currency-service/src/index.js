const express = require('express');
const cors = require('cors');
const { register, metricsMiddleware } = require('./metrics');
const { convert, listRates } = require('./data');

const SERVICE = process.env.SERVICE_NAME || 'currency-service';
const PORT = process.env.PORT || 8084;

const app = express();
app.use(cors());
app.use(metricsMiddleware);

app.get('/health', (req, res) => res.json({ status: 'ok', service: SERVICE }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// GET /rates
app.get('/rates', (req, res) => {
  res.json({ base: 'USD', rates: listRates() });
});

// GET /convert?from=USD&to=EGP&amount=100
app.get('/convert', (req, res) => {
  const from = String(req.query.from || '').toUpperCase();
  const to = String(req.query.to || '').toUpperCase();
  const amount = Number(req.query.amount);
  if (!from || !to || Number.isNaN(amount)) {
    return res.status(400).json({ error: 'from, to and numeric amount are required' });
  }
  const result = convert(from, to, amount);
  if (result == null) {
    return res.status(404).json({ error: `unsupported currency: ${from} or ${to}` });
  }
  res.json({ from, to, amount, result });
});

app.listen(PORT, () => console.log(`${SERVICE} listening on :${PORT}`));
