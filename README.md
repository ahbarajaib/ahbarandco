# Ahbar & Co.

Premium ecommerce platform for precision minimalist modern wood art and furniture.

## Brand

Ahbar & Co. creates precision wood art and furniture that blends clean design with premium longevity — warm, minimal, architectural, and intentional.

**Tagline:** Precision Wood Art. Designed to Last.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, Shadcn UI |
| Auth | Auth.js (NextAuth v5) — Email/Password + Google OAuth |
| Backend | Next.js Server Actions, Route Handlers |
| Database | PostgreSQL (Docker, local & free) |
| ORM | Prisma 7 |
| Payments | Razorpay |
| Storage | Cloudflare R2 (planned) |
| Hosting | Vercel (planned) |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (for local PostgreSQL)

### Setup

```bash
# Install dependencies
npm install

# Start local PostgreSQL (free, no cloud DB needed)
npm run docker:up

# Configure environment
cp .env.example .env
```

Required in `.env`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | `postgresql://ahbar:ahbar@localhost:15432/ahbarandco?schema=public` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` (client-side) |

```bash
# Apply database schema
npm run db:push

# Seed sample products (4 products, 4 images each)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker (Full Stack)

```bash
# Database only (recommended for development)
npm run docker:up

# Database + app container
docker compose up --build
```

## Features

- **Responsive** — Mobile, tablet, and desktop layouts on every page
- **Authentication** — Email/password + Google sign-in; protected checkout & account
- **Ecommerce** — Product catalog, multi-image galleries, cart, checkout
- **Razorpay** — Payment gateway with signature verification + webhooks
- **Local DB** — PostgreSQL via Docker, zero hosting cost for development

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/   # Auth.js handlers
│   ├── api/webhooks/razorpay/    # Payment webhooks
│   ├── products/[slug]/          # Product detail (multi-image)
│   ├── shop/ cart/ checkout/     # Commerce flow
│   ├── login/ register/ account/ # Auth pages
│   └── orders/[orderNumber]/     # Order confirmation
├── components/
│   ├── auth/                     # Login, register, Google OAuth
│   ├── ecommerce/                # Product card, gallery, Razorpay
│   └── layout/                   # Header, footer, mobile nav
├── lib/                          # Prisma, cart, payments, products
└── auth.ts / auth.config.ts      # Auth.js configuration
prisma/
├── schema.prisma                 # Database models
└── seed.ts                       # Sample catalog data
docs/
├── progress.md                   # Detailed task tracker
├── DESIGN_SYSTEM.md
├── ARCHITECTURE.md
├── PHOTOGRAPHY.md
└── ROUTES.md
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run docker:up` | Start local PostgreSQL container |
| `npm run docker:down` | Stop containers |
| `npm run db:push` | Apply schema to database |
| `npm run db:seed` | Seed sample products |
| `npm run db:studio` | Open Prisma Studio |

## Documentation

- **[Handoff Guide](./docs/HANDOFF.md)** — What's done and what you need to configure
- [Progress Tracker](./docs/progress.md) — Full task status
- [Design System](./docs/DESIGN_SYSTEM.md) — Brand, colors, responsive rules
- [Architecture](./docs/ARCHITECTURE.md) — Auth, payments, Docker
- [Routes](./docs/ROUTES.md) — URL structure
- [Photography](./docs/PHOTOGRAPHY.md) — Visual direction

## License

Private — All rights reserved.
