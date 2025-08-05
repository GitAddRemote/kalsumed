# Kalsumed

[![CI](https://img.shields.io/github/actions/workflow/status/gitaddremote/kalsumed/ci-cd.yml?branch=main)](https://github.com/gitaddremote/kalsumed/actions) [![Release](https://img.shields.io/github/v/release/gitaddremote/kalsumed)](https://github.com/gitaddremote/kalsumed/releases) [![License](https://img.shields.io/github/license/gitaddremote/kalsumed)](LICENSE)

Kalsumed is a multi-tenant SaaS platform for weight-loss and nutrition management. Designed to track daily food intake and provide users with insights into their caloric consumption. The name is derived from "Kilocalorie Consumed." This project integrates third‑party food data and plans to implement AI‑driven tooling to assist with food recognition and portion estimation from photos.

## Key Features

* Daily calorie tracking
* User-friendly interface for logging meals
* Tenant isolation and role-based access
* Real-time notifications via RabbitMQ
* Robust caching with Redis
* Environment-specific configuration via per-project `.env` files
* Planned integrations:
  * Food recognition using AI
  * Portion estimation via photos

## Tech Stack

* **Backend:** NestJS, TypeORM, PostgreSQL, Redis, RabbitMQ
* **Frontend:** React, MUI, Vite
* **Infrastructure:** Docker, Kubernetes, Terraform, Helm
* **Observability:** OpenTelemetry, Prometheus, Grafana, Loki, Jaeger
* **Security:** Vault, Unleash, Traefik
* **Testing:** Jest, Supertest, Pact, Artillery, OWASP ZAP

## Prerequisites

* Node.js (>=18) & pnpm
* Docker & Docker Compose
* `apps/backend/.env.dev` and `apps/frontend/.env.dev` created from their respective `.env.template` files

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/GitAddRemote/kalsumed.git
   cd kalsumed
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment**

   ```bash
   cp apps/backend/.env.template apps/backend/.env.dev
   cp apps/frontend/.env.template apps/frontend/.env.dev
   # Edit each .env.dev file with your local settings
   ```

4. **Run locally**

   ```bash
   pnpm dev
   ```

By default:

* Backend (NestJS) runs at `http://localhost:3000/api`
* Frontend (Vite) runs at `http://localhost:5173`
* Gateway (Traefik) listens on `http://localhost` (ports 80/443)

## Health Check

Verify the backend is up with the built‑in health endpoint:

```bash
# Simple curl
curl -i http://localhost:3000/api/health

# Pretty‑print with jq
curl -s http://localhost:3000/api/health | jq .
```

A successful response will return HTTP 200 and a JSON payload (e.g. `{ "status": "ok" }`).

## Docker Compose

Alternatively, spin up the full dev stack—including database, Redis, RabbitMQ, gateway, backend, and frontend—via Docker Compose:

```bash
# Build images and start services in the foreground
pnpm run compose:up:dev

# To stop and remove volumes
pnpm run compose:down:dev
```

## Building for Production

1. **Build all workspaces**

   ```bash
   pnpm run build
   ```

2. **Build production Docker images**

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   ```

3. **Run migrations & start services**

## Running Tests

```bash
pnpm test
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code style, branching, and pull requests.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
