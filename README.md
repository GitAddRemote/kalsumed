# 🥑 Kalsumed

[![CI](https://img.shields.io/github/actions/workflow/status/GitAddRemote/kalsumed/ci.yml?branch=main\&logo=github\&style=flat-square)](https://github.com/GitAddRemote/kalsumed/actions)
[![Last Commit](https://img.shields.io/github/last-commit/GitAddRemote/kalsumed?style=flat-square\&logo=git)](https://github.com/GitAddRemote/kalsumed/commits/main)
![Status](https://img.shields.io/badge/status-active--development-orange?style=flat-square)
[![License](https://img.shields.io/github/license/GitAddRemote/kalsumed?style=flat-square)](LICENSE)

**Kalsumed** is a **multi-tenant SaaS platform** for **nutrition and weight management**.
The name comes from **“Kilocalorie Consumed”** — the platform helps users log meals, track calories, and eventually leverage **AI-driven recognition** to identify foods and estimate portions from photos.

---

## 📦 Monorepo Structure

This project uses [Turborepo](https://turbo.build/) with [pnpm workspaces](https://pnpm.io/workspaces):

```
kalsumed/
├─ apps/
│  ├─ backend/        # NestJS API, TypeORM, Postgres, Redis, RabbitMQ
│  └─ frontend/       # React + Vite + MUI
├─ packages/          # Shared libraries (future-ready)
├─ docker/            # Dockerfiles and base images
├─ helm/              # Helm charts for Kubernetes deployment
├─ .github/workflows/ # CI/CD pipelines
└─ docs/              # Project documentation
```

---

## ✨ Features

* 📊 **Daily calorie tracking** with detailed logs
* 🏢 **Multi-tenant architecture** with role-based access
* ⚡ **Real-time notifications** via RabbitMQ
* 🔒 **Tenant isolation** and secure session management
* 🗄️ **Caching** and session storage with Redis
* 🛠️ **Environment-specific configuration** with per-project `.env` files
* 🔮 **Planned integrations**:

  * Food recognition (AI-powered)
  * Portion estimation from photos
  * Extended analytics dashboard

---

## 🛠️ Tech Stack

**Backend**

* [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/)
* PostgreSQL, Redis, RabbitMQ
* AuthN/AuthZ (JWT, OAuth, session)

**Frontend**

* [React](https://react.dev/), [MUI](https://mui.com/), [Vite](https://vitejs.dev/)

**Infrastructure**

* Docker & Docker Compose
* Kubernetes + Helm + Terraform
* Traefik (gateway), Vault (secrets), Unleash (feature flags)

**Observability**

* OpenTelemetry, Prometheus, Grafana, Loki, Jaeger

**Testing**

* Jest, Supertest, Pact, Artillery, OWASP ZAP

---

## 📋 Requirements

* [Node.js](https://nodejs.org/) **v20.x LTS**
* [pnpm](https://pnpm.io/) **v10.14.0+**
* [Docker](https://www.docker.com/) **24+** & [Docker Compose](https://docs.docker.com/compose/) **v2+**
* Optional: [Kubernetes](https://kubernetes.io/) cluster (local or cloud)

---

## 🚀 Getting Started (Local Dev)

### 1. Clone the repository

```bash
git clone https://github.com/GitAddRemote/kalsumed.git
cd kalsumed
```

### 2. Install dependencies

```bash
pnpm install --frozen-lockfile
```

### 3. Configure environment

Each app has its own `.env.development`:

```bash
cp apps/backend/.env.template apps/backend/.env.development
cp apps/frontend/.env.template apps/frontend/.env.development
```

Edit both with local settings (DB, Redis, RabbitMQ, secrets).

### 4. Run locally

```bash
pnpm dev
```

By default:

* Backend API → [http://localhost:3000/api](http://localhost:3000/api)
* Frontend → [http://localhost:5173](http://localhost:5173)
* Gateway (Traefik) → [http://localhost](http://localhost)

---

## 🩺 Health Check

Verify the backend is up:

```bash
curl -s http://localhost:3000/api/health | jq .
```

Expected response:

```json
{ "status": "ok" }
```

---

## 🐳 Docker Compose (Dev Stack)

Spin up Postgres, Redis, RabbitMQ, backend, frontend, and Traefik:

```bash
pnpm run compose:up:dev
```

Tear it down:

```bash
pnpm run compose:down:dev
```

---

## 🏗️ Production Build

1. Build all workspaces:

   ```bash
   pnpm build
   ```

2. Build production Docker images:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   ```

3. Run database migrations:

   ```bash
   pnpm run migration:run
   ```

---

## 🧪 Testing

Run the test suites:

```bash
pnpm test               # unit + integration
pnpm run test:contract  # contract tests
pnpm run test:load      # load testing
pnpm run test:security  # security scans
```

---

## 🗺️ Roadmap

* [ ] AI-powered food recognition
* [ ] Portion estimation from photos
* [ ] Mobile client (React Native / Expo)
* [ ] Extended analytics dashboard
* [ ] Multi-region deployments

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Notes

Kalsumed is in **active development** and not yet open for external contributions.
You can follow along via [commits](https://github.com/GitAddRemote/kalsumed/commits/main) or [releases](https://github.com/GitAddRemote/kalsumed/releases) once tagging begins.

---

> Built with ❤️ by [GitAddRemote](https://github.com/GitAddRemote)
> Under [Presstronic Studios LLC](https://presstronic.com)
