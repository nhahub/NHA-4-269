// Optional Redis cache. If REDIS_URL is unset or Redis is unreachable, the
// gateway runs fine without caching (graceful degradation).
const Redis = require('ioredis');
const { cacheEvents } = require('./metrics');

let client = null;
const TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 60);

if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });
  client.connect().catch((err) => {
    console.warn('Redis connect failed, running without cache:', err.message);
    client = null;
  });
  client.on('error', (err) => console.warn('Redis error:', err.message));
}

async function get(key) {
  if (!client) {
    cacheEvents.inc({ result: 'disabled' });
    return null;
  }
  try {
    const val = await client.get(key);
    cacheEvents.inc({ result: val ? 'hit' : 'miss' });
    return val ? JSON.parse(val) : null;
  } catch (err) {
    console.warn('cache get failed:', err.message);
    return null;
  }
}

async function set(key, value) {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), 'EX', TTL_SECONDS);
  } catch (err) {
    console.warn('cache set failed:', err.message);
  }
}

module.exports = { get, set, enabled: () => !!client };
