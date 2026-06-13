# Deployment Guide — ahbarandco.com

> **Status**: 🟡 CI/CD active — being finalized  
> **Last updated**: 2026-06-13  
> **Server**: Hostinger VPS — `31.97.205.18`  
> **Domain**: `ahbarandco.com` (Cloudflare DNS + SSL)

---

## Architecture

```
Developer (git push main)
        │
        ▼
GitHub Actions (.github/workflows/deploy.yml)
        │  SSH key auth
        ▼
VPS — /opt/ahbarandco
        │
        ├── docker compose (docker-compose.prod.yml)
        │       ├── ahbarandco-db    (postgres:16-alpine)
        │       ├── ahbarandco-migrate  (one-shot, exits after)
        │       └── ahbarandco-app   (Next.js standalone, port 3000)
        │
        └── Nginx (/etc/nginx/sites-enabled/ahbarandco)
                └── proxy_pass http://localhost:3000
                        │
                        ▼
              Cloudflare (DNS proxy + SSL Full Strict)
                        │
                        ▼
                  ahbarandco.com (HTTPS)
```

---

## Stack

| Component | Technology |
|-----------|-----------|
| App | Next.js 16 (standalone output) |
| Database | PostgreSQL 16 (Docker) |
| Schema | Prisma 7 (migrate workflow) |
| Reverse proxy | Nginx (host-installed) |
| SSL | Let's Encrypt via Certbot + Cloudflare DNS challenge |
| CDN / DNS | Cloudflare (Full Strict mode) |
| CI/CD | GitHub Actions → SSH deploy |
| Other apps on VPS | `imran-accounting` on port 3005 (separate compose) |

---

## Docker Image Stages

The [`Dockerfile`](../Dockerfile) has 5 stages:

| Stage | Purpose |
|-------|---------|
| `base` | `node:20-alpine` + `libc6-compat` |
| `deps` | `npm ci` — installs all dependencies |
| `builder` | Compiles Next.js production build |
| `migrate` | One-shot container — runs `prisma migrate deploy` and exits |
| `runner` | Minimal production image — only `@prisma/client`, no CLI |

The `migrate` service runs and **must complete successfully** before the `app` service starts (`service_completed_successfully`).

---

## CI/CD Pipeline

**Trigger**: Every push to `main` branch.

**Workflow file**: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

### Steps:
1. Checkout code on GitHub Actions runner
2. SSH into VPS (`appleboy/ssh-action`)
3. `git fetch + reset --hard origin/main` (updates code on VPS)
4. Verify `/opt/ahbarandco/.env` exists (fails fast if missing)
5. `docker compose -f docker-compose.prod.yml up -d --build --remove-orphans`
   - Builds `migrate` and `runner` images
   - Starts `db` → waits healthy → runs `migrate` → waits complete → starts `app`
6. Health check: `curl http://localhost:3000` must return 200
7. `docker image prune -f`

### GitHub Actions Secrets Required

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | `31.97.205.18` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Ed25519 private key (public key in `~/.ssh/authorized_keys` on VPS) |
| `GH_PAT` | Fine-grained PAT — `ahbarandco` repo, Contents: Read |

---

## VPS File Structure

```
/opt/ahbarandco/
├── .env                    # Production secrets — never commit
├── .git/                   # Git repo (cloned on first deploy)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       └── 20260613000000_init/
│           └── migration.sql
├── docker-compose.prod.yml
├── Dockerfile
└── ... (rest of codebase)
```

---

## Environment Variables (`/opt/ahbarandco/.env`)

```bash
# PostgreSQL
POSTGRES_USER=ahbar
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=ahbarandco

# Auth.js
AUTH_SECRET=<openssl rand -base64 32>
# AUTH_URL and NEXT_PUBLIC_SITE_URL are hardcoded in docker-compose.prod.yml

# Google OAuth
GOOGLE_CLIENT_ID=<from console.cloud.google.com>
GOOGLE_CLIENT_SECRET=<from console.cloud.google.com>

# Razorpay (use rzp_live_* in production)
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=<live-secret>
RAZORPAY_WEBHOOK_SECRET=<from Razorpay dashboard>

# SMTP (Resend)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=<resend-api-key>
SMTP_FROM="Ahbar & Co." <no-reply@ahbarandco.com>
```

> **Security**: `chmod 600 /opt/ahbarandco/.env`

---

## Prisma / Database Workflow

### Schema changes (correct production workflow)

**On your local machine:**
```bash
# 1. Edit prisma/schema.prisma
# 2. Create a migration
npx prisma migrate dev --name describe_your_change

# 3. Commit the new migration file
git add prisma/migrations/
git commit -m "db: add [field/table] to [model]"
git push origin main
# → CI/CD automatically runs prisma migrate deploy on production
```

**Never use `prisma db push` on production.** It is schema-only and does not create versioned migrations.

### Migration history

| Migration | Date | Notes |
|-----------|------|-------|
| `20260613000000_init` | 2026-06-13 | Baseline — all tables. Marked applied via `migrate resolve` because schema was bootstrapped with `db push`. |

---

## Nginx Configuration

**File**: `/etc/nginx/sites-available/ahbarandco`

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name ahbarandco.com www.ahbarandco.com;
    return 301 https://ahbarandco.com$request_uri;
}

# www → apex redirect
server {
    listen 443 ssl;
    server_name www.ahbarandco.com;
    ssl_certificate /etc/letsencrypt/live/ahbarandco.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ahbarandco.com/privkey.pem;
    return 301 https://ahbarandco.com$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl;
    server_name ahbarandco.com;
    ssl_certificate /etc/letsencrypt/live/ahbarandco.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ahbarandco.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20M;
    }
}
```

---

## SSL Certificate

- **Provider**: Let's Encrypt (via Certbot + Cloudflare DNS plugin)
- **Domains**: `ahbarandco.com`, `www.ahbarandco.com`
- **Expires**: 2026-09-10 (auto-renews via `certbot.timer` systemd timer)
- **Cloudflare SSL mode**: Full (Strict)

---

## Cloudflare DNS Records

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `31.97.205.18` | ✅ Proxied |
| A | `www` | `31.97.205.18` | ✅ Proxied |

---

## Geocoding (`📍 Use Location`)

- **API route**: [`/api/geocode`](../src/app/api/geocode/route.ts)
- **Provider**: Nominatim (OpenStreetMap) — free, no API key
- **Why a proxy?** Nominatim ToS requires a `User-Agent` header and prohibits direct browser calls from production apps
- **Flow**: Browser GPS coords → `/api/geocode` (server) → Nominatim → structured address fields
- **Cache**: 60s Next.js fetch cache

---

## Common Operations

### View live logs
```bash
ssh root@31.97.205.18
docker logs -f ahbarandco-app
```

### Restart app
```bash
docker compose -f /opt/ahbarandco/docker-compose.prod.yml restart app
```

### Manual deploy (without pushing to GitHub)
```bash
ssh root@31.97.205.18
cd /opt/ahbarandco
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
```

### Database backup
```bash
docker exec ahbarandco-db pg_dump -U ahbar ahbarandco > backup_$(date +%Y%m%d_%H%M).sql
```

### Check all container health
```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

---

## Coexistence with Other Docker Apps

The VPS also runs `imran-accounting` on port `3005`. Each app has its own:
- Docker Compose file and project
- Internal Docker network
- Nginx `server {}` block

Nginx routes by domain name:
- `ahbarandco.com` → `localhost:3000`
- `imranapi.mooo.com` → `localhost:3005`
