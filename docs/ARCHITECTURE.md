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
| `Product` | Furniture items, with optional delivery cost |
| `ProductVariant` | Choices for material/color with custom prices, stock, and images |
| `ProductImage` | Multiple images per product or specific product variants |
| `Order` | Purchase orders with Razorpay refs |
| `OrderItem` | Line items mapped to product and variant |
| `JournalPost` | Blog content (planned) |
| `NewsletterSubscriber` | Email list (planned) |

Prices stored as integers in paise (INR smallest unit).

## Cart & Slide-Over Drawer

- **Storage**: Cookie-based storage via an encrypted `ahbar_cart` HTTP-only cookie. Server actions inside [cart-actions.ts](file:///Users/ahbarajaib/iCloud%20Drive%20%28Archive%29/Documents/Documents%20-%20MacBook%20Air%20M3/Projects/ahbarandco/src/lib/cart-actions.ts) manipulate additions and updates directly on the server.
- **Client Synchronization**: A dynamic API route `/api/cart` ([route.ts](file:///Users/ahbarajaib/iCloud%20Drive%20%28Archive%29/Documents/Documents%20-%20MacBook%20Air%20M3/Projects/ahbarandco/src/app/api/cart/route.ts)) fetches the current cart with populated product data (names, prices, images).
- **State Management**: A React Context provider `CartDrawerProvider` ([cart-drawer-provider.tsx](file:///Users/ahbarajaib/iCloud%20Drive%20%28Archive%29/Documents/Documents%20-%20MacBook%20Air%20M3/Projects/ahbarandco/src/components/providers/cart-drawer-provider.tsx)) wraps the layout, exposing open/close states and optimistic update actions (`updateQuantity`, `removeItem`) for fast, local layout updates while coordinating mutations behind the scenes.
- **UI Element**: The slide-over drawer [CartDrawer](file:///Users/ahbarajaib/iCloud%20Drive%20%28Archive%29/Documents/Documents%20-%20MacBook%20Air%20M3/Projects/ahbarandco/src/components/ecommerce/cart-drawer.tsx) ([cart-drawer.tsx](file:///Users/ahbarajaib/iCloud%20Drive%20%28Archive%29/Documents/Documents%20-%20MacBook%20Air%20M3/Projects/ahbarandco/src/components/ecommerce/cart-drawer.tsx)) handles overlay, scrollable items, quantity selectors, and direct checkout routes.

## Directory Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/     # Auth.js route handler
│   ├── api/cart/                 # Dynamic cart details API
│   ├── api/webhooks/razorpay/    # Payment webhook
│   ├── products/[slug]/          # Product detail + gallery
│   ├── shop/ cart/ checkout/     # Commerce
│   ├── login/ register/ account/ # Auth UI
│   └── orders/[orderNumber]/     # Order details
├── components/
│   ├── auth/                     # Forms, Google button
│   ├── ecommerce/                # ProductCard, Gallery, Razorpay, CartDrawer
│   ├── layout/                   # Header, Footer, MobileNav, CartIconTrigger
│   └── providers/                # CartDrawerProvider context
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
