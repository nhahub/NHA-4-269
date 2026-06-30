// Static mock FX rates relative to USD. Good enough for demo / DevOps focus.
const RATES_TO_USD = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  EGP: 0.021,
  AED: 0.27,
  SAR: 0.27,
  QAR: 0.27,
  TRY: 0.031,
  JPY: 0.0064,
  CAD: 0.73,
};

function convert(from, to, amount) {
  const f = RATES_TO_USD[from];
  const t = RATES_TO_USD[to];
  if (f == null || t == null) return null;
  const usd = amount * f;
  const result = usd / t;
  return Math.round(result * 100) / 100;
}

function listRates() {
  return RATES_TO_USD;
}

module.exports = { convert, listRates, RATES_TO_USD };
