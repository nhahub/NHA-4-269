# Wanderly — Travel Aggregator (Microservices)

DEPI graduation project. Application layer for a DevOps pipeline.
A travel aggregator website: search **flights + hotels + weather** for a trip,
prices converted to a chosen currency. Built as independent microservices.
**No database** — services are stateless (mock data); Redis is used only as an
optional cache. A DB can be added later (e.g. a `booking-service`).

## Architecture

```
            ┌─────────────┐
            │  frontend   │  React + Vite, served by nginx (proxies /api)
            └──────┬──────┘
                   │ /api
            ┌──────▼──────┐
            │   gateway   │  fan-out + aggregate + optional Redis cache
            └──┬──┬──┬──┬─┘
       ┌───────┘  │  │  └────────┐
       ▼          ▼  ▼           ▼
  ┌────────┐ ┌──────┐ ┌────────┐ ┌──────────┐
  │ flight │ │hotel │ │weather │ │ currency │
  └────────┘ └──────┘ └────────┘ └──────────┘
                   │
              ┌────▼────┐
              │  redis  │ (cache only, optional)
              └─────────┘
```

## Services

| Service            | Port | Endpoints                                  |
|--------------------|------|--------------------------------------------|
| `gateway`          | 8080 | `/api/search`, `/api/flights`, `/api/hotels`, `/api/weather`, `/api/convert`, `/health`, `/metrics` |
| `flight-service`   | 8081 | `/flights?from=&to=&date=`, `/health`, `/metrics` |
| `hotel-service`    | 8082 | `/hotels?city=&checkin=&checkout=`, `/health`, `/metrics` |
| `weather-service`  | 8083 | `/weather?city=`, `/health`, `/metrics`    |
| `currency-service` | 8084 | `/convert?from=&to=&amount=`, `/rates`, `/health`, `/metrics` |
| `frontend`         | 80   | static SPA + `/api` proxy to gateway       |
| `redis`            | 6379 | gateway response cache (optional)          |

Every backend service exposes Prometheus metrics at `/metrics` and a liveness
probe at `/health`. Stack: **Node.js / Express**, **React / Vite**.

## Run it locally (Docker Compose)

```bash
docker compose up --build
# open http://localhost:8088
```

## Run a single service (no Docker)

```bash
cd services/flight-service && npm install && npm start
# http://localhost:8081/flights?from=CAI&to=DXB&date=2026-07-01
```

## Key example

```
GET /api/search?from=CAI&to=DXB&toCity=Dubai&date=2026-07-01&checkout=2026-07-05&currency=EGP
```
Gateway calls all four services in parallel, converts prices to EGP, merges
flights + hotels + weather into one response (cached in Redis if available).

## DevOps surface (handled separately)

- 6 containers, independent build/deploy per service
- Kubernetes: Deployments, Services, Ingress, HPA (autoscale gateway/flight)
- CI/CD: per-service build → test → image push (`.github/workflows/`)
- Monitoring: Prometheus scrapes `/metrics`; Grafana dashboards
- Secrets/config via env vars
- Liveness/readiness from `/health`

### Gateway env vars

| Var                 | Default                 | Purpose                   |
|---------------------|-------------------------|---------------------------|
| `FLIGHT_URL`        | `http://localhost:8081` | flight-service base URL    |
| `HOTEL_URL`         | `http://localhost:8082` | hotel-service base URL     |
| `WEATHER_URL`       | `http://localhost:8083` | weather-service base URL   |
| `CURRENCY_URL`      | `http://localhost:8084` | currency-service base URL  |
| `REDIS_URL`         | (unset → cache off)     | enable Redis cache         |
| `CACHE_TTL_SECONDS` | `60`                    | cache TTL                  |
