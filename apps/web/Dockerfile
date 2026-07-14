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
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

# ---------- Build ----------
FROM deps AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN pnpm --filter @finance/shared build \
  && pnpm --filter @finance/web build

# ---------- Runtime (Next.js standalone) ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
