# Ahbar & Co. — Routes & SEO Structure

## Primary Navigation

| Label | Path | Auth |
|-------|------|------|
| Home | `/` | Public |
| Shop | `/shop` | Public |
| Collections | `/collections` | Public |
| Journal | `/journal` | Public |
| About | `/about` | Public |

## Collection Pages

| Collection | Path | Status |
|------------|------|--------|
| Floating Shelves | `/floating-shelves` | ✅ Live (DB-driven) |
| Lounge Chairs | `/lounge-chairs` | ✅ Live (DB-driven) |

### Future Collections

| Collection | Path |
|------------|------|
| Dining Tables | `/dining-tables` |
| Coffee Tables | `/coffee-tables` |
| Sideboards | `/sideboards` |

## Product Pages

| Page | Path | Status |
|------|------|--------|
| Product Detail | `/products/[slug]` | ✅ Live (multi-image gallery) |

Examples:
- `/products/walnut-floating-shelf-36`
- `/products/oak-lounge-chair`

## Authentication

| Page | Path | Auth |
|------|------|------|
| Sign In | `/login` | Public |
| Register | `/register` | Public |
| Account | `/account` | **Required** |
| Auth API | `/api/auth/[...nextauth]` | — |

### Google OAuth Callback

Handled automatically by Auth.js at `/api/auth/callback/google`.

## Commerce

| Page | Path | Auth |
|------|------|------|
| Cart | `/cart` | Public |
| Checkout | `/checkout` | **Required** |
| Order Details | `/orders/[orderNumber]` | **Required** |

## Journal / Blog

| Page | Path | Status |
|------|------|--------|
| Index | `/journal` | ✅ Live (Prisma database driven) |
| Post | `/journal/[slug]` | ✅ Live (Rendered markdown content) |

## Administrative Portal

| Page | Path | Auth |
|------|------|------|
| Admin Login | `/admin/login` | Public |
| Dashboard Overview | `/admin` | **Required Admin** |
| Products CMS | `/admin/products` | **Required Admin** |
| Collections CMS | `/admin/collections` | **Required Admin** |
| Orders CMS | `/admin/orders` | **Required Admin** |
| Journal CMS | `/admin/journal` | **Required Admin** |

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...nextauth]` | GET, POST | Auth.js handlers |
| `/api/webhooks/razorpay` | POST | Razorpay payment webhook |

## SEO Conventions

- Page titles: `{Page Title} | Ahbar & Co.`
- Collection pages target material + product type keywords
- Product pages include material, dimensions in metadata
- All images require descriptive `alt` text
- Canonical URLs via `NEXT_PUBLIC_SITE_URL`
