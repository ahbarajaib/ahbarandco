# Ahbar & Co. — Project Progress

Last updated: June 9, 2026

## Summary

| Area | Status |
|------|--------|
| Foundation & Design System | ✅ Complete |
| Responsive Layout (Mobile / Tablet / Desktop) | ✅ Complete |
| Docker + Local PostgreSQL | ✅ Complete |
| Authentication (Email + Google) | ✅ Complete |
| Ecommerce (Multi-image Products, Cart, Checkout) | ✅ Complete |
| Razorpay Integration | ✅ Complete |
| Admin Dashboard & CMS | ✅ Complete |
| VPS Security & Ads Spacing Implementation | ✅ Complete |
| Documentation | ✅ Complete |
| Handoff guide (`docs/HANDOFF.md`) | ✅ Complete |

---

## Phase 1 — Foundation

| Task | Status | Notes |
|------|--------|-------|
| Scaffold Next.js 16 + TypeScript + Tailwind CSS v4 | ✅ Complete | App Router, `src/` directory |
| Initialize Shadcn UI | ✅ Complete | Button, Input, Label, Card, Sheet, Separator |
| Brand design tokens in `globals.css` | ✅ Complete | Warm ivory, walnut, dark wood palette |
| Typography (Cormorant Garamond + Inter) | ✅ Complete | Headings + body fonts via `next/font` |
| Site layout (Header, Footer, Section) | ✅ Complete | Dark wood header, responsive footer |
| Navigation constants | ✅ Complete | `src/lib/constants.ts` |
| Prisma schema (catalog models) | ✅ Complete | Collection, Product, ProductImage, JournalPost |
| Prisma client singleton | ✅ Complete | Prisma 7 + `@prisma/adapter-pg` |
| Placeholder pages (Shop, Collections, About, Journal) | ✅ Complete | SEO collection routes at root level |
| Homepage structure (Hero, Collections, Craft) | ✅ Complete | Featured products section added |
| `.env.example` | ✅ Complete | All required environment variables |
| `README.md` | ✅ Complete | Getting started guide |
| `AGENTS.md` | ✅ Complete | AI/coding agent guide |
| `docs/DESIGN_SYSTEM.md` | ✅ Complete | Brand, colors, typography, components |
| `docs/ARCHITECTURE.md` | ✅ Complete | Stack, modules, data flow |
| `docs/PHOTOGRAPHY.md` | ✅ Complete | Visual direction for imagery |
| `docs/ROUTES.md` | ✅ Complete | URL structure and SEO |

---

## Phase 2 — Responsive Design

| Task | Status | Notes |
|------|--------|-------|
| Mobile navigation (hamburger + sheet drawer) | ✅ Complete | `src/components/layout/mobile-nav.tsx` |
| Redesign mobile menu drawer layout & styling | ✅ Complete | Replaced dashboard blocks with elegant Cormorant Garamond headings and bottom line utilities |
| Upgrade desktop navigation typography | ✅ Complete | Added tracked uppercase Inter styling (`text-[11px] tracking-[0.18em] uppercase`) |
| Responsive header (compact on mobile) | ✅ Complete | Hidden desktop nav below `lg`, mobile menu below `md` |
| Responsive section spacing | ✅ Complete | `py-12` mobile → `py-28` desktop |
| Responsive typography scale | ✅ Complete | All pages use `sm:` / `md:` / `lg:` breakpoints |
| Responsive product grids | ✅ Complete | 1 col mobile → 2 tablet → 3–4 desktop |
| Responsive product detail layout | ✅ Complete | Stacked mobile, 2-column desktop |
| Responsive cart & checkout layouts | ✅ Complete | Summary sidebar stacks below on mobile |
| Responsive auth forms | ✅ Complete | Full-width buttons on mobile |
| Responsive footer grid | ✅ Complete | 1 → 2 → 3 column layout |

---

## Phase 3 — Docker & Local Database

| Task | Status | Notes |
|------|--------|-------|
| `docker-compose.yml` with PostgreSQL 16 | ✅ Complete | Free local DB, no cloud cost |
| `Dockerfile` for production app image | ✅ Complete | Multi-stage standalone Next.js image, sharp pipeline compiled natively |
| `.dockerignore` | ✅ Complete | Excludes node_modules, .env |
| Docker healthcheck for Postgres | ✅ Complete | `pg_isready` check |
| `npm run docker:up` script | ✅ Complete | Starts DB container only |
| `npm run docker:down` / `docker:logs` | ✅ Complete | Container management |
| Database seed script | ✅ Complete | `prisma/seed.ts` — 4 products, 4 images each |
| `npm run db:seed` script | ✅ Complete | Populates catalog after migration |

---

## Phase 4 — Authentication

| Task | Status | Notes |
|------|--------|-------|
| Prisma auth models (User, Account, Session, VerificationToken) | ✅ Complete | NextAuth-compatible schema |
| Auth.js (NextAuth v5) setup | ✅ Complete | `src/auth.ts` + edge-safe `src/auth.config.ts` |
| Email/password registration | ✅ Complete | `src/app/register/page.tsx` |
| Email/password login | ✅ Complete | `src/app/login/page.tsx` |
| Google OAuth login | ✅ Complete | `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` |
| Protected route middleware | ✅ Complete | `/checkout`, `/account`, `/orders` |
| Account page with order history | ✅ Complete | `src/app/account/page.tsx` |
| Sign in / Sign out in header | ✅ Complete | Server actions via `src/lib/oauth-actions.ts` |
| Session JWT with user ID | ✅ Complete | Extended `next-auth` types |

---

## Phase 5 — Ecommerce

| Task | Status | Notes |
|------|--------|-------|
| Product listing page (`/shop`) | ✅ Complete | DB-driven product grid |
| Collection pages with products | ✅ Complete | `/floating-shelves`, `/lounge-chairs` |
| Product detail page (`/products/[slug]`) | ✅ Complete | Full product info + related products |
| Multi-image product gallery | ✅ Complete | `src/components/ecommerce/product-gallery.tsx` |
| Thumbnail navigation (4+ images) | ✅ Complete | Client-side image switching |
| Product card component | ✅ Complete | Image, name, price, quick view hover |
| Add to cart (server action + cookie cart) | ✅ Complete | `src/lib/cart.ts` |
| Slide-Over Cart Drawer implementation | ✅ Complete | Instant add-to-cart slider drawer, optimistic quantity updater, and `/api/cart` route syncing |
| Cart page with quantity controls | ✅ Complete | `src/app/cart/page.tsx` |
| Checkout page (auth required) | ✅ Complete | Order summary + payment |
| Order detail page | ✅ Complete | `/orders/[orderNumber]` |
| Order models linked to User | ✅ Complete | Replaced Customer with User |
| Homepage featured products | ✅ Complete | Pulls `featured: true` from DB |
| Price formatting (INR / paise) | ✅ Complete | `formatPrice()` utility |

---

## Phase 6 — Razorpay Payments

| Task | Status | Notes |
|------|--------|-------|
| Razorpay SDK integration | ✅ Complete | `src/lib/razorpay.ts` |
| Create Razorpay order on checkout | ✅ Complete | `createCheckoutOrder()` server action |
| Razorpay Checkout.js client widget | ✅ Complete | `src/components/ecommerce/razorpay-checkout.tsx` |
| Payment signature verification | ✅ Complete | HMAC SHA-256 server-side |
| Order status update on payment | ✅ Complete | `PENDING` → `PAID` |
| Razorpay webhook handler | ✅ Complete | `POST /api/webhooks/razorpay` |
| Webhook signature verification | ✅ Complete | `x-razorpay-signature` header |
| Cart cleared after successful payment | ✅ Complete | `emptyCart()` on verify |
| Environment variables documented | ✅ Complete | `RAZORPAY_*` in `.env.example` |

---

## Phase 7 — Documentation Updates

| Task | Status | Notes |
|------|--------|-------|
| Update `README.md` (Docker, Auth, Razorpay) | ✅ Complete | |
| Update `docs/ARCHITECTURE.md` | ✅ Complete | Auth, payments, Docker sections |
| Update `docs/ROUTES.md` | ✅ Complete | New commerce + auth routes |
| Update `docs/DESIGN_SYSTEM.md` | ✅ Complete | Responsive breakpoints section |
| Update `AGENTS.md` | ✅ Complete | Auth, Docker, Razorpay conventions |
| Create `docs/progress.md` | ✅ Complete | This file |

## Upcoming / Not Started

| Task | Status | Notes |
|------|--------|-------|
| Newsletter signup flow | ⬜ Not started | Model exists, no UI yet |
| Cloudflare R2 image uploads | ⬜ Not started | Using Unsplash placeholders in seed |
| Search functionality | ⬜ Not started | Header link is placeholder |
| Production deployment (Vercel) | ⬜ Not started | Docker + standalone build ready |
| Email notifications (order confirmation) | ⬜ Not started | |
| Production VPS Hosting setup | ⬜ Not started | Audited and documented in `PRODUCTION_SECURITY_ADS.md` |

---

## Phase 8 — Admin Dashboard & Security Audit

| Task | Status | Notes |
|------|--------|-------|
| Admin login & middleware authentication | ✅ Complete | Separate auth flow from customer accounts |
| Product & collection management forms | ✅ Complete | Dynamic image lists, slug auto-generation |
| Order management & status fulfillment dropdown | ✅ Complete | Instant status revalidations |
| Journal/Blog CMS editor | ✅ Complete | Full article creation, deletion, and edits |
| VPS hosting & Ads layout implementation | ✅ Complete | Implemented security headers, secure cookies, rate-limiting middleware, Zod schemas, and AdBlock-safe Google AdSense component |

---

## Quick Start (Current State)

```bash
# 1. Start local database (free, port 15432)
npm run docker:up

# 2. Configure environment
cp .env.example .env
# Set AUTH_SECRET, GOOGLE_*, RAZORPAY_* as needed

# 3. Push schema + seed data
npm run db:push
npm run db:seed

# 4. Run dev server
npm run dev
```
