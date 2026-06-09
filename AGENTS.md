# Ahbar & Co. — Agent Guide

## Project

Premium ecommerce website for handcrafted minimalist modern furniture.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + Shadcn UI
- PostgreSQL (Docker, local) + Prisma 7
- Auth.js v5 — Credentials + Google OAuth
- Razorpay payments
- Cloudflare R2 (planned) + Vercel (planned)

## Key Docs

- [Progress Tracker](./docs/progress.md) — Full task status (check before starting work)
- [Design System](./docs/DESIGN_SYSTEM.md) — Brand, colors, responsive rules
- [Architecture](./docs/ARCHITECTURE.md) — Auth, payments, Docker
- [Routes](./docs/ROUTES.md) — URL structure
- [Photography](./docs/PHOTOGRAPHY.md) — Visual direction

## Design Rules

- **Bright UI** — warm ivory backgrounds, never site-wide dark mode
- **Products are the hero** — large photography, minimal chrome
- **Responsive** — every page must work on mobile, tablet, and desktop
- **Fonts** — Cormorant Garamond (headings), Inter (body)
- **Colors** — use CSS tokens from `src/app/globals.css`
- **Motion** — subtle only (fade, soft reveal, gentle zoom)

## Code Conventions

- Server Components by default
- Server Actions in separate `"use server"` files (never inline in client components)
- Edge-safe auth: `src/auth.config.ts` for middleware (no Prisma import)
- Full auth: `src/auth.ts` with Prisma adapter
- Use `Section` component for page sections
- Prisma client via `src/lib/prisma.ts` (server only)
- Prices in paise (integers)
- Cart stored in httpOnly cookie

## Auth

- Protected routes: `/checkout`, `/account`, `/orders/*`
- Google OAuth via `signInWithGoogle` in `src/lib/oauth-actions.ts`
- Credentials via `loginUser` / `registerUser` in `src/lib/auth-actions.ts`

## Payments

- Razorpay checkout via `createCheckoutOrder()` + `verifyPayment()`
- Webhook at `/api/webhooks/razorpay`
- Requires `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`

## Local Dev

```bash
npm run docker:up    # Start PostgreSQL
npm run db:push      # Apply schema
npm run db:seed      # Sample products
npm run dev
```

## Next.js

<!-- BEGIN:nextjs-agent-rules -->
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
