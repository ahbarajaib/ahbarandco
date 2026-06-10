# Ahbar & Co. — Architecture

## Overview

Ahbar & Co. is built as a **modular monolith** on Next.js — a single deployable application with clearly separated internal modules.

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel / Docker                          │
├─────────────────────────────────────────────────────────────┤
│                      Next.js App                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐ │
│  │  Pages   │ │  Server  │ │  Route   │ │  Auth.js      │ │
│  │  (RSC)   │ │  Actions │ │ Handlers │ │  Middleware   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘ │
│       └────────────┴────────────┴───────────────┘         │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────────────┐   │
│  │           Prisma ORM + Business Logic                  │   │
│  └──────────────────────┬──────────────────────────────┘   │
├─────────────────────────┼───────────────────────────────────┤
│  PostgreSQL (Docker)    │  Razorpay    Google OAuth         │
└─────────────────────────┴───────────────────────────────────┘
```

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Shadcn UI |
| Auth | Auth.js v5 (Credentials + Google OAuth) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Database | PostgreSQL 16 (Docker, local) |
| Payments | Razorpay (orders, checkout, webhooks) |
| Deployment | Docker + Vercel (standalone build) |

## Local Development (Free)

PostgreSQL runs in Docker — no paid cloud database required:

```bash
npm run docker:up          # Starts postgres:16-alpine on port 5432
npm run db:push            # Applies schema
npm run db:seed            # Seeds sample products
```

Connection string: `postgresql://ahbar:ahbar@localhost:15432/ahbarandco` (port 15432 avoids conflict with other local Postgres instances)

## Authentication

### Providers

| Provider | Flow |
|----------|------|
| **Credentials** | Email + password, bcrypt hashed (`passwordHash` on User) |
| **Google OAuth** | Standard OAuth 2.0 via Google Cloud Console |

### Files

| File | Purpose |
|------|---------|
| `src/auth.config.ts` | Edge-safe config (used by proxy) |
| `src/auth.ts` | Full config with Prisma adapter + Credentials |
| `src/proxy.ts` | Protects `/checkout`, `/account`, `/orders` |
| `src/lib/auth-actions.ts` | Register + login server actions |
| `src/lib/oauth-actions.ts` | Google sign-in + sign-out actions |

### Session

JWT strategy with `user.id` in session token. Prisma adapter persists User/Account records for OAuth.

### Protected Routes

Middleware redirects unauthenticated users to `/login?callbackUrl=...` for:

- `/checkout`
- `/account`
- `/orders/*`

## Payments (Razorpay)

### Checkout Flow

```
Cart → Checkout (auth required)
  → createCheckoutOrder() — creates DB Order + Razorpay order
  → Razorpay Checkout.js widget opens
  → User pays
  → verifyPayment() — HMAC signature check
  → Order status: PAID, cart cleared
  → Redirect to /orders/[orderNumber]
```

### Webhook (Backup)

`POST /api/webhooks/razorpay` handles `payment.captured` events with `x-razorpay-signature` verification.

### Environment

```
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=    # Same as KEY_ID for client widget
```

## Database Models

| Model | Purpose |
|-------|---------|
| `User` | Auth + customer identity |
| `Account` | OAuth provider accounts |
| `Session` | Database sessions (OAuth) |
| `Collection` | Product groupings |
| `Product` | Furniture items |
| `ProductImage` | Multiple images per product |
| `Order` | Purchase orders with Razorpay refs |
| `OrderItem` | Line items |
| `JournalPost` | Blog content (planned) |
| `NewsletterSubscriber` | Email list (planned) |

Prices stored as integers in paise (INR smallest unit).

## Cart

Cookie-based cart (`ahbar_cart` httpOnly cookie). Server actions in `src/lib/cart-actions.ts` manage add/update/remove. Cart persists across sessions but checkout requires authentication.

## Directory Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/     # Auth.js route handler
│   ├── api/webhooks/razorpay/    # Payment webhook
│   ├── products/[slug]/          # Product detail + gallery
│   ├── shop/ cart/ checkout/     # Commerce
│   ├── login/ register/ account/ # Auth UI
│   └── orders/[orderNumber]/     # Order details
├── components/
│   ├── auth/                     # Forms, Google button
│   ├── ecommerce/                # ProductCard, Gallery, Razorpay
│   └── layout/                   # Header, Footer, MobileNav
├── lib/
│   ├── prisma.ts                 # DB client singleton
│   ├── products.ts               # Catalog queries
│   ├── cart.ts / cart-actions.ts # Cart logic
│   ├── razorpay.ts               # Payment utilities
│   └── payment-actions.ts        # Checkout server actions
├── auth.ts / auth.config.ts
└── proxy.ts
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
docker-compose.yml
Dockerfile
```

## Responsive Design

All pages use Tailwind responsive breakpoints:

| Breakpoint | Target |
|------------|--------|
| Default | Mobile (< 640px) |
| `sm:` | Large phones / small tablets (≥ 640px) |
| `md:` | Tablets (≥ 768px) |
| `lg:` | Desktop (≥ 1024px) |
| `xl:` | Large desktop (≥ 1280px) |

Mobile navigation uses a Sheet drawer (`md:hidden`). Desktop nav visible at `lg:`.

## Conventions

- Server Components by default; Client Components only for interactivity
- Server Actions for mutations (cart, auth, payments)
- Route Handlers for webhooks
- Edge-safe `auth.config.ts` for middleware (no Prisma import)
- Prisma client only in server context
- All prices in paise (integers)

## Production & VPS Hosting

For detailed guidelines on VPS deployments, self-hosted proxy rate-limiting, database backup scripts, local media uploads, and Google Ads responsive spacing, please refer to the [Production Security & Ads Placement Guide](./PRODUCTION_SECURITY_ADS.md).
