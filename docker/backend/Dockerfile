FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml turbo.json pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile

COPY apps/backend/package.json apps/backend/
COPY apps/backend ./apps/backend
# remove if you don't use libs
COPY libs ./libs

RUN pnpm --filter @kalsumed/backend build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/apps/backend/dist ./dist
COPY --from=builder /usr/src/app/apps/backend/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

CMD ["node", "dist/main"]
