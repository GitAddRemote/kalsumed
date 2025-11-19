# Kalsumed

**Multi-tenant Healthcare Management Platform**

A full-stack monolith application built with React and Spring Boot, designed for enterprise scalability.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Axios** for API communication

### Backend
- **Java 21** / **Spring Boot 3.3.4**
- **PostgreSQL 16** with Flyway migrations
- **Redis** for caching and rate limiting
- **Apache Kafka** for event-driven architecture
- **JWT** authentication with BCrypt password hashing
- **OpenTelemetry** + **Prometheus** + **Tempo** for observability

### Infrastructure
- Docker Compose for local development
- Grafana for monitoring dashboards

## Project Structure

- `apps/frontend/` — React application (Vite + TypeScript)
- `apps/backend/` — Spring Boot API service
- `libs/common/` — Shared DTOs/utilities
- `monitoring/` — Prometheus & Tempo configs

## Quick Start

### 1. Start Infrastructure Services

```bash
docker compose up -d db redis zookeeper kafka prometheus tempo grafana
```

This starts PostgreSQL, Redis, Kafka, and monitoring stack.

### 2. Run Backend

```bash
# Using local Maven
mvn -q -T 1C -DskipTests package
cd apps/backend && mvn spring-boot:run

# Or using Docker Maven wrapper
./scripts/mvnw.sh -q -T 1C -DskipTests package
./scripts/mvnw.sh -pl apps/backend spring-boot:run
```

Backend will start on **http://localhost:8080**

### 3. Run Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Frontend will start on **http://localhost:3000**

### 4. First-Time Setup

1. Navigate to http://localhost:3000
2. Click "Create a new account"
3. Register with your email and password
4. You'll be automatically logged in and redirected to the dashboard

## Multi-Tenancy & User Roles

The application supports three user roles:

- **SUPER_ADMIN**: Kalsumed representatives who can manage all tenants and create new organizations
- **ORG_ADMIN**: Organization administrators who can manage their own tenant
- **USER**: Regular users within a tenant (default for all new registrations)

All users are initially assigned to the "default" tenant. The tenant concept is transparent to users until multi-tenant features are explicitly enabled.

## Authentication Features

### Current Implementation
- JWT-based authentication with 1-hour token expiration
- BCrypt password hashing
- Rate limiting: 10 login attempts per 5 minutes per IP
- Token blacklisting on logout (stored in Redis)
- Complete password reset flow with time-limited tokens
- Email enumeration protection

### Authentication Flow
1. **Registration**: User registers → auto-login → redirect to dashboard
2. **Login**: Credentials validated → JWT token issued → stored in localStorage
3. **Logout**: Token blacklisted in Redis → user redirected to login
4. **Password Reset**:
   - User requests reset → token generated (1-hour expiry)
   - Reset link sent (currently logged to console)
   - User clicks link → enters new password → token validated and consumed

### Frontend Routes
- `/` → Redirects to dashboard
- `/login` → Login page
- `/register` → Registration page
- `/forgot-password` → Request password reset
- `/reset-password?token=XXX` → Reset password with token
- `/dashboard` → Main dashboard (protected route)

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `POST /api/auth/logout` - Logout (blacklist JWT)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Profile (`/api/profile`)
- `GET /api/profile/me` - Get current user profile
- `PUT /api/profile` - Update user profile
- `DELETE /api/profile` - Delete user account

### Health & Monitoring
- `GET /actuator/health` - Spring Boot health check
- `GET /health/ping` - Simple ping endpoint
- `GET /actuator/prometheus` - Prometheus metrics

### Stubs (Coming Soon)
- `GET /api/ingredients` - List ingredients
- `GET /api/meals` - List meals
- `POST /api/events/test` - Kafka event demo

### Observability
- **Prometheus** scrapes `/actuator/prometheus`.
- **Tempo** receives OTLP traces; set `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317` when running locally.
- **Grafana** (http://localhost:3000, admin/admin). Add Prometheus (http://prometheus:9090) and Tempo (http://tempo:3200) as data sources.

> Note: Prometheus is configured to scrape `host.docker.internal:8080`. On Linux, update to your host gateway (often `172.17.0.1`).

## Environment Configuration

### Backend (application.yml or environment variables)
```bash
DB_URL=jdbc:postgresql://localhost:5432/kalsumed
DB_USER=kalsumed
DB_PASS=kalsumed
REDIS_URL=redis://localhost:6379
KAFKA_BOOTSTRAP=localhost:9092
JWT_SECRET=please-change-this-very-long-random-secret-12345678901234567890
JWT_TTL_SECONDS=3600
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

### Frontend (.env file in apps/frontend/)
```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Development

### Frontend Development
```bash
cd apps/frontend

# Install dependencies
npm install

# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Backend Development
```bash
cd apps/backend

# Run tests
mvn test

# Package
mvn clean package

# Run with Docker
docker build -t kalsumed-backend -f Dockerfile ../..
docker run -p 8080:8080 kalsumed-backend
```

## Security Considerations

### Current Implementation
- JWT tokens stored in localStorage
- CORS configured for localhost (ports 3000, 5173)
- Password reset tokens logged to console (dev mode)
- Rate limiting on login endpoint
- Email enumeration protection in password reset

### Production Recommendations
1. **Implement email service** (SMTP, SendGrid, AWS SES) for password reset
2. **Use httpOnly cookies** for JWT storage instead of localStorage
3. **Enable HTTPS/TLS** termination
4. **Implement refresh token rotation**
5. **Add 2FA/MFA** support
6. **Comprehensive audit logging**
7. **Row-level security** for tenant data isolation
8. **Secrets management** (HashiCorp Vault, AWS Secrets Manager)
9. **Update CORS** configuration for production domains
10. **Implement proper tenant context** resolution and data filtering

## Roadmap

### Completed
- ✅ JWT authentication with registration, login, logout
- ✅ Password reset flow with time-limited tokens
- ✅ Role-based access control (SUPER_ADMIN, ORG_ADMIN, USER)
- ✅ Multi-tenancy foundation
- ✅ React frontend with modern tooling (Vite, TypeScript, Tailwind)
- ✅ Protected routes and authentication context
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Observability stack

### Immediate Next Steps
- [ ] Implement email service for password reset
- [ ] Add user profile editing in frontend
- [ ] Implement super admin tenant management UI
- [ ] Add domain entities (meals, recipes, ingredients)
- [ ] Implement proper tenant isolation at data access layer
- [ ] Add tenant context resolution

### Future Enhancements
- [ ] OAuth2/OIDC SSO integration (Google, Microsoft, etc.)
- [ ] React Native mobile app
- [ ] Advanced multi-tenancy (subdomain routing, tenant-specific schemas)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Integration and E2E tests
- [ ] CI/CD pipeline
- [ ] Kubernetes deployment manifests
- [ ] Advanced meal planning features
- [ ] Nutrition tracking and analytics

## License
Proprietary — All Rights Reserved.
