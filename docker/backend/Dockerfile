# docker/backend/Dockerfile

# ---- Build Stage ----
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Copy only deps for caching
COPY package.json pnpm-lock.yaml turbo.json pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Copy source & build
COPY . .
RUN pnpm --filter @kalsumed/backend build

# ---- Run Stage ----
FROM node:18-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy built artifacts + deps
COPY --from=build /usr/src/app/apps/backend/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY apps/backend/package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]

