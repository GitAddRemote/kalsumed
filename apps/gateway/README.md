# Kalsumed – API Gateway

Traefik-based gateway providing:
- TLS termination (cert-manager)
- Rate limiting, IP whitelisting
- Authentication middleware
- Routing to backend services

## Build & Run

```bash
cd apps/gateway
docker build -t kalsumed-gateway .
``` 
