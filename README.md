# Kalsumed (Java / Spring Boot Monorepo)

**Java 21 / Spring Boot 3** with **Postgres**, **Redis**, **Kafka**, **JWT**, **Tenant scaffold**, and **Observability** (Actuator + Prometheus + OpenTelemetry → Tempo).

- `apps/backend` — API service
- `libs/common` — shared DTOs/utilities
- `monitoring/` — Prometheus & Tempo configs

## Quick Start

```bash
# Infra (DB/Redis/Kafka + Monitoring)
docker compose up -d db redis zookeeper kafka prometheus tempo grafana

# Build & run
mvn -q -T 1C -DskipTests package
cd apps/backend && mvn spring-boot:run
# or
./scripts/mvnw.sh -q -T 1C -DskipTests package
./scripts/mvnw.sh -pl apps/backend spring-boot:run
```

### Endpoints
- Health: `GET /actuator/health`, `GET /health/ping`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/me`
- Profile: `GET /api/profile`, `PUT /api/profile`, `DELETE /api/profile`
- Stubs: `GET /api/ingredients`, `GET /api/meals`
- Kafka demo: `POST /api/events/test` (produces to `kalsumed.events`)

### Redis features
- **JWT blocklist**: `/api/auth/logout` revokes current token until its expiry.
- **Basic rate limiting**: max 10 login attempts / 5 minutes per IP.

### Observability
- **Prometheus** scrapes `/actuator/prometheus`.
- **Tempo** receives OTLP traces; set `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317` when running locally.
- **Grafana** (http://localhost:3000, admin/admin). Add Prometheus (http://prometheus:9090) and Tempo (http://tempo:3200) as data sources.

> Note: Prometheus is configured to scrape `host.docker.internal:8080`. On Linux, update to your host gateway (often `172.17.0.1`).

## Environment
```
DB_URL=jdbc:postgresql://localhost:5432/kalsumed
DB_USER=kalsumed
DB_PASS=kalsumed
REDIS_URL=redis://localhost:6379
KAFKA_BOOTSTRAP=localhost:9092
JWT_SECRET=please-change-this-very-long-random-secret-12345678901234567890
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

## License
Proprietary — All Rights Reserved.
