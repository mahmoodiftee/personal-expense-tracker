# syntax=docker/dockerfile:1
# ---------- Base ----------
FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile

# ---------- Build ----------
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @finance/shared build \
  && pnpm --filter @finance/api build \
  && pnpm --filter @finance/api --prod deploy /out

# ---------- Runtime ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
# Non-root user for security.
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
COPY --from=build --chown=nestjs:nodejs /out/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /out/dist ./dist
COPY --from=build --chown=nestjs:nodejs /out/package.json ./package.json
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]
