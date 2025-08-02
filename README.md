# Kalsumed

[![CI](https://img.shields.io/github/actions/workflow/status/gitaddremote/kalsumed/ci-cd.yml?branch=main)](https://github.com/gitaddremote/kalsumed/actions)
[![Release](https://img.shields.io/github/v/release/gitaddremote/kalsumed)](https://github.com/gitaddremote/kalsumed/releases)
[![License](https://img.shields.io/github/license/gitaddremote/kalsumed)](LICENSE)

Kalsumed is a multi-tenant SaaS platform for weight-loss and nutrition management. Designed to track daily food intake and provide users with insights into their caloric consumption. The name is derived from "Kilocalorie Consumed." This project aims to integrate a third-party API for food data and implement AI-driven tooling to assist with food recognition and portion estimation from photos.

### Key Features
- Daily calorie tracking
- User-friendly interface for logging meals
- Planned integrations for:
  - Food recognition using AI
  - Portion estimation via photos


## Tech Stack

- **Backend:** NestJS, TypeORM, PostgreSQL, Redis, RabbitMQ
- **Frontend:** React, MUI, Vite
- **Infrastructure:** Docker, Kubernetes, Terraform, Helm
- **Observability:** OpenTelemetry, Prometheus, Grafana, Loki, Jaeger
- **Security:** Vault, Unleash, Traefik
- **Testing:** Jest, Supertest, Pact, Artillery, OWASP ZAP

## Getting Started

1. Install dependencies
   ```bash
   pnpm install
   ```

2. Run locally
   ```bash
   pnpm dev
   ```

3. View documentation
   - API → docs/api
   - Architecture → docs/architecture

## Contributing

Please see [CONTRIBUTING.md](/CONTRIBUTING.md).
