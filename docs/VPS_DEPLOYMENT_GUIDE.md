# VPS Standalone Docker Deployment Guide

The absolute best, most secure, and **100% free way** to host **Ahbar & Co.** on your VPS is using **Docker Compose** paired with **Caddy Server** as a reverse proxy.

This architecture keeps the database completely private, handles automatic SSL/TLS certificates for free, and runs the entire application on the VPS with zero external dependencies.

---

## Architecture Overview

```
                      ┌─────────────────────────────────┐
                      │            Your VPS             │
                      │  ┌──────────────────────────┐   │
                      │  │       Caddy Proxy        │   │
                      │  │  (Automatic SSL / Port)  │   │
                      │  └────────────┬─────────────┘   │
                      │               │ (Proxy pass)    │
                      │  ┌────────────▼─────────────┐   │
                      │  │   Next.js App Container  │   │
                      │  │      (localhost:3000)    │   │
                      │  └────────────┬─────────────┘   │
                      │               │ (Internal Net)  │
                      │  ┌────────────▼─────────────┐   │
                      │  │    PostgreSQL Container  │   │
                      │  │      (Internal: 5432)    │   │
                      │  └──────────────────────────┘   │
                      └─────────────────────────────────┘
```

- **Next.js App (Runner)**: Serves the website. It compiles to a lightweight container using the `standalone` option.
- **Postgres Database**: Runs locally. The port is **not mapped** to the public internet; Next.js talks to it directly via Docker's internal virtual network.
- **Caddy Server**: Installed on the host machine. It routes domain requests (HTTP/HTTPS) to Next.js on port 3000 and automatically manages Let's Encrypt SSL updates.

---

## Step-by-Step Deployment

### Step 1: Install Docker & Caddy on your VPS
Log in to your VPS via SSH and run these commands to install the required packages:

```bash
# Update VPS packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Caddy Server (Ubuntu/Debian)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy -y
```

---

### Step 2: Set up Project Directory & Environment
Create a folder for the website files on your VPS:

```bash
mkdir -p /var/www/ahbarandco
cd /var/www/ahbarandco
```

Create a production `.env` file in this folder:
```bash
nano .env
```

**Paste the following template and replace placeholders with secure secrets:**
```env
# Database (Internal Docker network - replace with a strong password)
DATABASE_URL="postgresql://ahbar:YOUR_SECURE_PASSWORD@db:5432/ahbarandco?schema=public"

# Auth.js Config (Generate a secure secret key: openssl rand -base64 32)
AUTH_SECRET="YOUR_RANDOM_BASE64_SECRET"
AUTH_URL="https://ahbarandco.com"
NEXT_PUBLIC_SITE_URL="https://ahbarandco.com"

# Razorpay (Payments)
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="your-live-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_WEBHOOK_SECRET="your-live-webhook-secret"

# Google Auth (OAuth)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

---

### Step 3: Production Docker Compose Configuration
Create a production-specific Docker Compose file:
```bash
nano docker-compose.prod.yml
```

**Paste the following configuration:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: ahbarandco-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ahbar
      POSTGRES_PASSWORD: YOUR_SECURE_PASSWORD # Must match .env
      POSTGRES_DB: ahbarandco
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ahbar -d ahbarandco"]
      interval: 5s
      timeout: 5s
      retries: 5
    # Note: No public ports are mapped! Database is 100% private.

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ahbarandco-app
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000" # Exposed only to localhost, Caddy routes traffic here
    environment:
      DATABASE_URL: postgresql://ahbar:YOUR_SECURE_PASSWORD@db:5432/ahbarandco?schema=public
      AUTH_SECRET: ${AUTH_SECRET}
      AUTH_URL: ${AUTH_URL}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET}
      RAZORPAY_WEBHOOK_SECRET: ${RAZORPAY_WEBHOOK_SECRET}
      NEXT_PUBLIC_RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
    volumes:
      - /var/lib/ahbarandco/uploads:/app/public/uploads # Local folder mapped to container uploads
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
```

---

### Step 4: Configure Caddy Reverse Proxy
Point your domain name (`A` record) in your DNS panel (e.g. Cloudflare, GoDaddy) to your VPS IP address.

Configure Caddy to forward traffic and manage SSL:
```bash
sudo nano /etc/caddy/Caddyfile
```

**Paste the following configuration:**
```caddy
# Automatically serves HTTPS for your domain
ahbarandco.com, www.ahbarandco.com {
    # Compress traffic
    encode gzip zstd

    # Route request to Next.js running in Docker
    reverse_proxy localhost:3000
}
```

Restart Caddy to apply changes:
```bash
sudo systemctl restart caddy
```

---

### Step 5: Start Services & Seed Database
Build and run the services:
```bash
# Start Postgres and build the Next.js Standalone app
docker compose -f docker-compose.prod.yml up -d --build

# Run Prisma schema migration (applies migrations to DB)
docker compose -f docker-compose.prod.yml run --rm migrate

# Seed the database (creates catalog collections, products, and default admin)
docker compose -f docker-compose.prod.yml run --rm migrate npx prisma db seed
```

Your website is now live, secured under SSL HTTPS at `https://ahbarandco.com`!

---

## Maintenance & Zero-Downtime Deployments

To deploy updates, create a one-click script on your VPS (`/var/www/ahbarandco/deploy.sh`):

```bash
#!/bin/bash
set -e

# Pull latest code
git pull origin main

# Rebuild Next.js app in background
docker compose -f docker-compose.prod.yml build app

# Recreate Next.js container (almost 0 downtime)
docker compose -f docker-compose.prod.yml up -d --no-deps app

# Clean unused Docker images to save space
docker image prune -f

echo "Deployment complete."
```

Make it executable: `chmod +x deploy.sh`. Run `./deploy.sh` whenever you push changes to GitHub!
