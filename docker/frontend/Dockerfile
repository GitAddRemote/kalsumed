# docker/frontend/Dockerfile

# ---- Build Stage ----
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Install deps
COPY package.json pnpm-lock.yaml turbo.json pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Copy source & build
COPY . .
RUN pnpm --filter @kalsumed/frontend build

# ---- Run Stage ----
FROM nginx:stable-alpine AS runner

# Remove default site
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=build /usr/src/app/apps/frontend/dist /usr/share/nginx/html

# Optional: custom nginx.conf
# COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

