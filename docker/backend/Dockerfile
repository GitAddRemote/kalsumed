FROM node:20-alpine AS builder
WORKDIR /usr/src/apps/backend

COPY package.json pnpm-lock.yaml turbo.json pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate && pnpm install --frozen-lockfile

COPY apps/backend/package.json apps/backend/
COPY apps/backend ./apps/backend
# remove if you don't use libs
COPY libs ./libs

RUN pnpm --filter @kalsumed/backend build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app

COPY --from=builder /usr/src/apps/backend/dist ./dist
COPY --from=builder /usr/src/apps/backend/package.json ./
COPY --from=builder /usr/src/apps/backend/node_modules ./node_modules

CMD ["node", "dist/main"]
