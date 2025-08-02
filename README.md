# Kalsumed

[![CI](https://img.shields.io/github/actions/workflow/status/$GITHUB_USER/$REPO_NAME/ci-cd.yml?branch=$BRANCH)](https://github.com/$GITHUB_USER/$REPO_NAME/actions)
[![Release](https://img.shields.io/github/v/release/$GITHUB_USER/$REPO_NAME)](https://github.com/$GITHUB_USER/$REPO_NAME/releases)
[![License](https://img.shields.io/github/license/$GITHUB_USER/$REPO_NAME)](LICENSE)

Kalsumed is a multi-tenant SaaS platform for weight-loss and nutrition management.

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
