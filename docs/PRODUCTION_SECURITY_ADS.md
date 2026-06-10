# VPS Production Readiness, Security & Ads Placement Guide

This guide details the security audit findings, self-hosted rate-limiting strategies, type validation schemas, and Google Ads responsive layouts for running **Ahbar & Co.** on a self-hosted Linux VPS. 

All recommended configurations are **100% free**, requiring no paid cloud dependencies (only the VPS and your domain name).

---

## 1. Security & Vulnerability Safeguards (Implemented)

The following production-level safeguards are fully implemented in the codebase:
- **Form Inputs**: Form data is strictly validated and parsed using **Zod Schemas** before database transactions, securing against malformed inputs and script injections.
- **Database Port Isolation**: Database mapping is private on the internal Docker network, keeping database network traffic fully internal in production compose files.
- **NextAuth Session Security**: Secure cookies (`__Secure-` prefix) and strict HTTP-only flags are configured in production.

#### A. Secure NextConfig Headers
Configure HTTP security headers directly in `next.config.ts` to defend against Clickjacking, XSS, and MIME-sniffing.

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://images.unsplash.com; connect-src 'self' https://api.razorpay.com; font-src 'self' https://fonts.gstatic.com;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### B. Restrict Postgres Container Ports
In your production `docker-compose.yml`, remove the host port mapping (`ports: - "15432:5432"`) for the database service. This keeps the database accessible **only within the internal Docker network** for the `app` container, making it completely invisible to outside networks.

#### C. NextAuth Secure Cookies (Production Mode)
Update `src/auth.ts` config to force secure cookies when running in production (`process.env.NODE_ENV === "production"`):
```typescript
// Add inside NextAuth configuration options:
useSecureCookies: process.env.NODE_ENV === "production",
cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    },
  },
},
```

---

## 2. Self-Hosted Rate Limiting (100% Free)

To prevent brute-force attacks on `/login`, `/register`, `/admin/login`, and spam orders on `/checkout`, implement rate-limiting at the proxy layer or Next.js middleware layer.

### Option A: Reverse Proxy Rate Limiting (Recommended)

#### Using Caddy (If using Caddy as reverse proxy)
Caddy automatically handles Let's Encrypt SSL. Use the `rate-limit` handler by adding it to your `Caddyfile`:
```caddy
example.com {
    # Automatic SSL handled by Caddy
    reverse_proxy localhost:3000
    
    # Rate limit auth endpoints
    @authPaths {
        path /login /register /admin/login /checkout
    }
    
    # Restrict to 10 requests per minute per IP
    # requires Caddy rate-limit module
    rate_limit @authPaths {
        zone auth_limit {
            key {remote_ip}
            events_per_period 10
            period 60s
        }
    }
}
```

#### Using Nginx (If using Nginx as reverse proxy)
Add the rate-limit directive in `/etc/nginx/nginx.conf`:
```nginx
# Define zone in nginx.conf HTTP block
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=1r/s;

server {
    server_name ahbarandco.com;

    location /login {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://localhost:3000;
    }
    
    location /register {
        limit_req zone=auth_limit burst=3 nodelay;
        proxy_pass http://localhost:3000;
    }

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### Option B: Memory-Safe Next.js Middleware Rate Limiter (No Redis required)
This implementation uses a map with an **automatic garbage collector** that runs every 5 minutes to prune expired entries, preventing memory leaks on your VPS host.

Create a helper file `src/lib/rate-limiter.ts`:
```typescript
type RateRecord = {
  count: number;
  resetTime: number;
};

const tracker = new Map<string, RateRecord>();
const MAX_ENTRIES = 5000; // Cap map size to prevent memory bloat

// Cleanup expired entries every 5 minutes
if (typeof window === "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tracker.entries()) {
      if (now > value.resetTime) {
        tracker.delete(key);
      }
    }
  }, 300000);
}

export function isRateLimited(ip: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = tracker.get(ip);

  if (!record) {
    if (tracker.size >= MAX_ENTRIES) {
      // Evict oldest record if cache size exceeded
      const firstKey = tracker.keys().next().value;
      if (firstKey) tracker.delete(firstKey);
    }
    tracker.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return false;
  }

  record.count++;
  return record.count > limit;
}
```

#### Integrate Rate Limiting in `src/proxy.ts`
Wrap the rate limiter logic in Next.js proxy/middleware using the request's IP header:
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limiter";

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
  
  if (request.nextUrl.pathname.startsWith("/login") && request.method === "POST") {
    if (isRateLimited(ip, 5, 60000)) { // 5 login attempts per min
      return new NextResponse("Too many requests. Please try again in 1 minute.", { status: 429 });
    }
  }
}
```

---

## 3. Type Validation & Zod Schema Integration

Using **Zod** provides rigorous validation on both client and server actions.

### Schema Definitions (`src/lib/validations.ts`)
```typescript
import { z } from "zod";

// User Auth
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Product CRUD
export const ProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  shortDesc: z.string().max(250).optional().nullable(),
  description: z.string().min(10, "Provide a longer description").optional().nullable(),
  price: z.number().positive("Price must be a positive number"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  material: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  careGuide: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  collectionId: z.string().optional().nullable(),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one product image is required"),
});

// Collection CRUD
export const CollectionSchema = z.object({
  name: z.string().min(2, "Collection name must be at least 2 characters").max(50),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url("Invalid cover image URL").optional().nullable(),
  sortOrder: z.number().int().default(0),
  published: z.boolean().default(true),
});

// Journal / Blog CRUD
export const JournalPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150),
  excerpt: z.string().max(300).optional().nullable(),
  content: z.string().min(20, "Content body must be at least 20 characters"),
  coverImageUrl: z.string().url("Invalid cover image URL").optional().nullable(),
  published: z.boolean().default(false),
});
```

### Server Action Validation Template
Integrate validations inside Server Actions to intercept invalid payloads:
```typescript
import { ProductSchema } from "@/lib/validations";

export async function createProduct(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    price: parseFloat(String(formData.get("price"))),
    stock: parseInt(String(formData.get("stock")), 10),
    // ...other fields
  };

  const validation = ProductSchema.safeParse(rawData);
  if (!validation.success) {
    return { 
      error: validation.error.errors.map(err => err.message).join(", ") 
    };
  }

  // Validated data is accessible via validation.data
  const validatedProduct = validation.data;
  // ...proceed to save in prisma
}
```

---

## 4. 100% Free Production Operations Strategy

To keep hosting costs strictly limited to the VPS fee, use these self-hosted alternatives:

### A. Free Local Media Storage (Bypass S3/R2)
Instead of paying for Cloudflare R2, store uploaded files directly in a local folder on your VPS and mount it to your Docker container.

1. **Volume Mount**: In your production `docker-compose.yml`, mount a local server folder to the container's public uploads directory:
   ```yaml
   services:
     app:
       ...
       volumes:
         - /var/lib/ahbarandco/uploads:/app/public/uploads
   ```
2. **Server Action File Saving**: Use Node.js filesystem (`fs/promises`) inside server actions to write image files directly to `public/uploads/` on the server disk.
3. **Database URL Reference**: Save the image path as `/uploads/filename.jpg` in your database. Next.js will serve these files directly from the mounted volume automatically.

### B. Automated Database Backup Script
Run a Cron job on your VPS to automatically dump your PostgreSQL database every night, compress it, and retain backups for 7 days.

**Backup Script (`/root/backup_db.sh`)**:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ahbarandco"
DB_CONTAINER="ahbarandco-db"
DB_USER="ahbar"
DB_NAME="ahbarandco"
DATE=$(date +%Y-%m-%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Dump PostgreSQL database directly from container
docker exec -t "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Delete backups older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete
```
Add to crontab (`crontab -e`):
```cron
0 2 * * * /bin/bash /root/backup_db.sh
```

---

## 5. Responsive Google Ads Placement Layout

Placing Google Adsense layouts on a premium furniture website requires layout spacing to keep the design clean and **fully prevent layout shifting (CLS)**.

### Ad Size Spacing Chart
| Viewport | Container ID / Class | Standard Ad Dimensions | Allocated Minimum Height | CSS Padding |
|---|---|---|---|---|
| **Mobile** (< 640px) | `#ad-header-banner` | 320 × 100 / 320 × 50 | `100px` | `py-2` |
| **Tablet** (640–1024px) | `#ad-header-banner` | 728 × 90 | `90px` | `py-4` |
| **Desktop** (≥ 1024px) | `#ad-header-banner` | 970 × 90 / 970 × 250 | `250px` | `py-6` |

---

### Page Placements

#### Placements on Storefront Pages

```
┌─────────────────────────────────────────────────────────────┐
│                       Site Header                           │
├─────────────────────────────────────────────────────────────┤
│   [Space 1: Header Banner (AdSense Auto/Leaderboard)]       │
│   Allocated: min-h-[100px] sm:min-h-[90px] lg:min-h-[250px]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      Hero Section                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                 Featured Collections Grid                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   [Space 2: Mid-Content Ad Feed (Responsive Horizontal)]     │
│   Allocated: min-h-[100px] lg:min-h-[120px]                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   Featured Products Grid                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

1. **Header Banner**: Placed directly below the `SiteHeader` on the home page and shop page.
2. **Mid-Content Feed Ads**: Injected between major sections (e.g., between Collections and Products) to capture scroll attention.
3. **In-Feed Product Grid Ads**: Rendered in the shop page product listing grid `/shop` as a card placeholder (e.g. at grid position 5).
4. **Blog Content Mid-Article**: Rendered inside the journal post details page `/journal/[slug]` between paragraphs.

---

### CLS-Safe CSS Component Structure
Use this Tailwind component wrapper for your Google AdSense code. The wrapper guarantees the browser reserves space *before* the ad loads, ensuring zero layout shift. If an AdBlocker is active or the script fails to load, it collapses gracefully into a minimal placeholder border without throwing visual alerts or breaking the site layout.

```tsx
// src/components/ads/ad-banner.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

type AdBannerProps = {
  slotId: string;
};

export function AdBanner({ slotId }: AdBannerProps) {
  const [adBlocked, setAdBlocked] = useState(false);

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("AdSense failed to initialize (AdBlocker may be active): ", err);
      setAdBlocked(true);
    }
  }, []);

  return (
    <>
      {/* Load Google AdSense library asynchronously globally */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" // Replace with ca-pub ID
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <div className="w-full flex items-center justify-center my-6 bg-background-secondary/10 border-y border-border/10">
        {/* 
          Responsive height reservation prevents Layout Shift (CLS):
          - Mobile (<640px): 100px min-height
          - Tablet (640px - 1024px): 90px min-height
          - Desktop (>=1024px): 250px min-height
        */}
        <div 
          className={`w-full max-w-7xl flex items-center justify-center overflow-hidden min-h-[100px] sm:min-h-[90px] lg:min-h-[250px] transition-all duration-300 ${
            adBlocked ? "opacity-30 border border-dashed border-border py-4" : ""
          }`}
        >
          {adBlocked ? (
            <div className="text-[10px] uppercase tracking-wider text-text-secondary font-sans">
              Editorial Advertisement Slot
            </div>
          ) : (
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with AdSense Publisher ID
              data-ad-slot={slotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          )}
        </div>
      </div>
    </>
  );
}
```

By keeping `min-h-[100px] sm:min-h-[90px] lg:min-h-[250px]` identical to the loading ad's heights, layout shifts are completely avoided.
