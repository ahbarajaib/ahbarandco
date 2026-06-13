# ── Stage 1: base ────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── Stage 2: deps — install all dependencies ─────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci --frozen-lockfile

# ── Stage 3: builder — compile Next.js ───────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ── Stage 4: migrate — runs prisma migrate deploy (one-shot job) ─────────────
# Has full node_modules so all CLI tools are available.
# Used by docker-compose.prod.yml as a service with restart: "no".
FROM deps AS migrate
COPY . .
RUN npx prisma generate
CMD ["npx", "prisma", "migrate", "deploy"]

# ── Stage 5: runner — minimal production image ───────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone Next.js output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma runtime — generated client is at src/generated/prisma (custom output path)
# @prisma/client is the runtime package; the engine binaries come with it
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/src/generated ./src/generated

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
