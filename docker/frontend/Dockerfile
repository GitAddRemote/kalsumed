# Build stage
FROM node:18-alpine AS builder

WORKDIR /workspace

COPY package.json pnpm-lock.yaml turbo.json pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install
COPY apps/frontend ./apps/frontend
RUN pnpm --filter @kalsumed/frontend build

# Run stage
FROM nginx:stable-alpine

COPY --from=builder /workspace/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
