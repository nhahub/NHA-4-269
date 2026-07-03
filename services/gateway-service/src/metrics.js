// Prometheus metrics setup. Gateway adds extra metrics for cache + upstream calls.
const client = require('prom-client');

const register = new client.Registry();
register.setDefaultLabels({ service: process.env.SERVICE_NAME || 'gateway' });
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestsTotal);

const cacheEvents = new client.Counter({
  name: 'gateway_cache_events_total',
  help: 'Cache hits and misses',
  labelNames: ['result'], // hit | miss | disabled
});
register.registerMetric(cacheEvents);

const upstreamRequests = new client.Counter({
  name: 'gateway_upstream_requests_total',
  help: 'Requests made to upstream microservices',
  labelNames: ['target', 'outcome'], // outcome: ok | error
});
register.registerMetric(upstreamRequests);

function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.baseUrl + req.route.path : req.path;
    const labels = { method: req.method, route, status: res.statusCode };
    end(labels);
    httpRequestsTotal.inc(labels);
  });
  next();
}

module.exports = { register, metricsMiddleware, cacheEvents, upstreamRequests };
