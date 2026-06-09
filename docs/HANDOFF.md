# Ahbar & Co. — Handoff Guide

This document explains **what has been built**, **how to run it**, and **what you need to configure yourself** before the store is fully operational.

For a detailed task-by-task breakdown, see [progress.md](./progress.md).

---

## What Has Been Done

### 1. Website Foundation

A complete Next.js 16 ecommerce foundation with the Ahbar & Co. design system:

- **Stack:** Next.js, TypeScript, Tailwind CSS v4, Shadcn UI, Prisma 7, PostgreSQL
- **Brand styling:** Warm ivory backgrounds, walnut accents, dark wood header/footer
- **Fonts:** Cormorant Garamond (headings) + Inter (body)
- **Layout:** Header, footer, reusable `Section` component
- **Pages:** Home, Shop, Collections, About, Journal, collection landing pages

### 2. Responsive Design (Mobile, Tablet, Desktop)

Every page is responsive:

- Mobile hamburger menu (sheet drawer)
- Product grids: 1 column on phone → 2 on tablet → 3–4 on desktop
- Product detail page stacks on mobile, side-by-side on desktop
- Cart and checkout adapt for smaller screens
- Touch-friendly buttons and spacing

### 3. Local Database (Docker — Free)

You do **not** need a paid cloud database for development:

- PostgreSQL 16 runs in Docker via `docker-compose.yml`
- Exposed on **port 15432** (avoids conflicts with other Postgres on your machine)
- Schema is defined in `prisma/schema.prisma`
- Sample data seeded: **4 products**, each with **4 images**

### 4. Authentication

Users can sign in with:

| Method | Route | Status |
|--------|-------|--------|
| Email + password | `/register`, `/login` | Ready (works now) |
| Google OAuth | `/login`, `/register` | Needs your Google credentials |

Protected pages (login required):

- `/checkout`
- `/account`
- `/orders/[orderNumber]`

### 5. Ecommerce Flow

Full shopping flow is wired up:

```
Browse → Product page → Add to cart → Cart → Checkout → Razorpay → Order confirmation
```

| Feature | Route | Details |
|---------|-------|---------|
| Product catalog | `/shop` | Pulls from database |
| Collection pages | `/floating-shelves`, `/lounge-chairs` | Filtered by collection |
| Product detail | `/products/[slug]` | Multi-image gallery with thumbnails |
| Cart | `/cart` | Cookie-based, quantity controls |
| Checkout | `/checkout` | Auth required, order summary |
| Order page | `/orders/[orderNumber]` | Shows status and line items |

**Sample product URLs** (after seeding):

- `/products/walnut-floating-shelf-36`
- `/products/walnut-floating-shelf-48`
- `/products/oak-lounge-chair`
- `/products/walnut-lounge-chair`

### 6. Razorpay Payments

Payment integration is built but needs your API keys:

- Creates a Razorpay order on checkout
- Opens Razorpay payment widget
- Verifies payment signature server-side
- Updates order status to `PAID`
- Webhook handler at `POST /api/webhooks/razorpay`

### 7. Documentation

| File | Purpose |
|------|---------|
| [README.md](../README.md) | Quick start |
| [progress.md](./progress.md) | Full task tracker |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Brand, colors, typography |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture |
| [ROUTES.md](./ROUTES.md) | All URLs |
| [PHOTOGRAPHY.md](./PHOTOGRAPHY.md) | Image direction |
| **This file** | What you need to do |

---

## What You Need To Do

### Step 1 — Run the project locally

**Prerequisites:** Node.js 20+, Docker Desktop

```bash
# Install dependencies (first time only)
npm install

# Start the database
npm run docker:up

# Apply schema + seed sample products (first time only)
npm run db:push
npm run db:seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** If `docker:up` fails with a port conflict, another service is using that port. Edit `docker-compose.yml` and change `15432:5432` to another free port, then update `DATABASE_URL` in `.env` to match.

---

### Step 2 — Configure environment variables

Copy the example file if you haven't already:

```bash
cp .env.example .env
```

Your `.env` file should live at the project root. Here is what **you** must set:

#### Required for auth (email login works with just this)

```bash
AUTH_SECRET="your-random-secret"
```

Generate a secret:

```bash
openssl rand -base64 32
```

Also set:

```bash
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

#### Required for Google login

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Copy Client ID and Secret into `.env`:

```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

For production, add your live domain redirect URI too (e.g. `https://ahbarandco.com/api/auth/callback/google`).

#### Required for payments (Razorpay)

1. Sign up at [Razorpay](https://dashboard.razorpay.com/)
2. Use **Test Mode** for development
3. Go to **Settings → API Keys** and generate keys
4. Add to `.env`:

```bash
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."   # Same as KEY_ID
```

#### Required for webhooks (optional locally, required in production)

1. In Razorpay Dashboard → **Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhooks/razorpay`
3. Select event: `payment.captured`
4. Copy the webhook secret:

```bash
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"
```

> For local webhook testing, use a tunnel tool like [ngrok](https://ngrok.com/) to expose `localhost:3000`.

#### Database (already configured for Docker)

```bash
DATABASE_URL="postgresql://ahbar:ahbar@localhost:15432/ahbarandco?schema=public"
```

No changes needed unless you changed the Docker port.

---

### Step 3 — Test the full flow

Use this checklist after `npm run dev` is running:

- [ ] Browse `/shop` — see 4 seeded products
- [ ] Open a product — switch between 4 gallery images
- [ ] Register at `/register` with email + password
- [ ] Sign in at `/login`
- [ ] Add a product to cart → view `/cart`
- [ ] Go to `/checkout` (must be signed in)
- [ ] Pay with Razorpay test card (after adding keys)
- [ ] Confirm order appears at `/account` and `/orders/[orderNumber]`
- [ ] Test Google sign-in (after adding Google credentials)
- [ ] Resize browser or use phone — confirm mobile menu and layouts work

**Razorpay test card** (test mode):

| Field | Value |
|-------|-------|
| Card number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |

---

### Step 4 — Replace placeholder content

The seed data uses **Unsplash placeholder images**. Before launch you should:

1. **Photography** — Shoot or source real product images per [PHOTOGRAPHY.md](./PHOTOGRAPHY.md)
2. **Products** — Update names, prices, descriptions in the database (via Prisma Studio or an admin panel)
3. **Homepage hero** — Add a real lifestyle image (currently a colored placeholder block)
4. **Collection cards** — Add collection cover images
5. **About / Craft sections** — Add workshop photography and real copy

Open Prisma Studio to edit data visually:

```bash
npm run db:studio
```

---

### Step 5 — Production deployment (when ready)

Not yet deployed. When you are ready:

| Task | Action |
|------|--------|
| **Hosting** | Deploy to [Vercel](https://vercel.com) (recommended for Next.js) |
| **Database** | Use a managed Postgres (Neon, Supabase, or Railway free tier) — or self-host |
| **Environment** | Set all `.env` variables in Vercel dashboard |
| **Google OAuth** | Add production redirect URI |
| **Razorpay** | Switch to Live Mode keys |
| **Webhooks** | Point Razorpay webhook to `https://yourdomain.com/api/webhooks/razorpay` |
| **Images** | Set up Cloudflare R2 (variables in `.env.example`) or use another CDN |
| **Domain** | Point `ahbarandco.com` (or your domain) to Vercel |
| **AUTH_SECRET** | Generate a new production secret — do not reuse the dev one |

Docker full-stack option:

```bash
docker compose up --build   # Runs DB + app together
```

---

## What Is NOT Done Yet

These are planned but not built. See [progress.md](./progress.md) for the full list.

| Feature | Status |
|---------|--------|
| Journal / blog posts | Placeholder page only |
| Newsletter signup | Database model exists, no UI |
| Search | Header link is a placeholder |
| Admin dashboard | No product/order management UI |
| Cloudflare R2 uploads | Using external image URLs in seed |
| Real product photography | Placeholder images only |
| Email order confirmations | Not implemented |
| Production deployment | Not deployed |

---

## Useful Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (verify before deploy) |
| `npm run docker:up` | Start PostgreSQL container |
| `npm run docker:down` | Stop containers |
| `npm run docker:logs` | View database logs |
| `npm run db:push` | Apply schema changes to database |
| `npm run db:seed` | Reset and re-seed sample products |
| `npm run db:studio` | Visual database editor |

---

## Project Structure (Quick Reference)

```
src/
├── app/                    # All pages and API routes
│   ├── products/[slug]/    # Product detail + image gallery
│   ├── shop/ cart/ checkout/
│   ├── login/ register/ account/
│   └── api/auth/           # Auth.js
│       api/webhooks/razorpay/
├── components/
│   ├── auth/               # Login, register, Google button
│   ├── ecommerce/          # ProductCard, Gallery, Razorpay
│   └── layout/             # Header, Footer, MobileNav
├── lib/                    # Business logic
│   ├── prisma.ts           # Database client
│   ├── products.ts         # Catalog queries
│   ├── cart.ts             # Cart cookie logic
│   ├── razorpay.ts         # Payment utilities
│   └── payment-actions.ts  # Checkout server actions
├── auth.ts                 # Auth.js (full config)
└── auth.config.ts          # Auth.js (edge/middleware config)
prisma/
├── schema.prisma           # Database models
└── seed.ts                 # Sample data
docker-compose.yml          # Local PostgreSQL
.env                        # Your secrets (not committed to git)
```

---

## Getting Help

- **Task status:** [docs/progress.md](./progress.md)
- **How things connect:** [docs/ARCHITECTURE.md](./ARCHITECTURE.md)
- **Brand rules:** [docs/DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **All URLs:** [docs/ROUTES.md](./ROUTES.md)

If something breaks:

1. Check Docker is running: `docker ps` (look for `ahbarandco-db`)
2. Check `.env` has correct `DATABASE_URL` and `AUTH_SECRET`
3. Re-run `npm run db:push` after schema changes
4. Run `npm run build` to catch TypeScript errors before deploy

---

## Summary

| Area | Built by us | You need to |
|------|-------------|-------------|
| Website & design system | ✅ | Add real photos and copy |
| Responsive layouts | ✅ | Review on your devices |
| Local database (Docker) | ✅ | Run `docker:up` when developing |
| Email auth | ✅ | Set `AUTH_SECRET` |
| Google login | ✅ Code ready | Add Google OAuth credentials |
| Products & cart | ✅ | Replace seed data with real catalog |
| Razorpay checkout | ✅ Code ready | Add Razorpay test/live keys |
| Production deploy | ❌ | Deploy to Vercel + managed DB when ready |

**Minimum to start developing today:** Docker running + `AUTH_SECRET` in `.env` + `npm run dev`.

**Minimum to test payments:** Add Razorpay test keys.

**Minimum to launch:** Real products/images, live Razorpay keys, production hosting, Google OAuth production URI, and a production database.
