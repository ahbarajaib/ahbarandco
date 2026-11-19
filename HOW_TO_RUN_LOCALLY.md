# How to Run Locally

This guide walks you through setting up and running **Ahbar & Co.** locally on your machine for testing and development, while keeping your live VPS production environment separate and safe.

---

## Technical Stack & Prerequisites

For anyone evaluating or running this project locally:

- **Runtime**: Node.js v20 or v22+
- **Database**: PostgreSQL 16 (runs locally via Docker on isolated port `15432`)
- **ORM & Migrations**: Prisma 7 (with `@prisma/adapter-pg`; migration history tracked in `prisma/migrations/`)
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Dependencies**: Managed via npm with dependencies locked in `package-lock.json`
- **Docker**: Docker Desktop (for the local PostgreSQL container)

---

## Quick Start (Summary)

```bash
# 1. Install dependencies
npm install

# 2. Set up local environment file
cp .env.example .env

# 3. Start local PostgreSQL container (port 15432)
npm run docker:up

# 4. Push database schema / migrations
npm run db:push

# 5. Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Detailed Step-by-Step Setup

### Step 1: Install Dependencies

Install project packages and compile the Prisma client:

```bash
npm install
```

> **Note:** The `postinstall` script automatically executes `prisma generate` to produce the typed client under `src/generated/prisma`.

---

### Step 2: Configure Environment Variables

Create your local `.env` file from the provided example template:

```bash
cp .env.example .env
```

Open `.env` in your editor and configure the following settings:

1. **Database URL** (points to local Docker PostgreSQL on port `15432`):
   ```env
   DATABASE_URL="postgresql://ahbar:ahbar@localhost:15432/ahbarandco"
   ```
   *(Port `15432` is configured to prevent conflicts if port `5432` is already in use by another database on your computer).*

2. **Auth Secret**:
   Generate a random secret for local sessions:
   ```bash
   openssl rand -base64 32
   ```
   Paste the output into `.env`:
   ```env
   AUTH_SECRET="your-generated-random-secret"
   ```

3. **App URLs**:
   ```env
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

4. **Razorpay Payments (Test Mode)**:
   Configure your own personal Razorpay test credentials in your local `.env` file:
   - Log in or register for a free account at [Razorpay Dashboard](https://dashboard.razorpay.com/).
   - Ensure the dashboard toggle is set to **Test Mode**.
   - Navigate to **Account & Settings** → **API Keys** (under *Developer Controls*).
   - Click **Generate Test Key** (or view your active test key).
   - Copy the generated keys into your local `.env`:
     ```env
     RAZORPAY_KEY_ID="rzp_test_YOUR_OWN_KEY"
     RAZORPAY_KEY_SECRET="YOUR_OWN_SECRET"
     NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YOUR_OWN_KEY"
     ```

   > [!IMPORTANT]
   > Never commit real API keys or secrets to the repository. The credentials previously exposed in Git history should be rotated immediately, even if they were test credentials.

---

### Step 3: Start the Local PostgreSQL Database

Make sure Docker Desktop is running, then launch the local database container:

```bash
npm run docker:up
```

This runs `docker compose up -d db`, creating a PostgreSQL 16 container named `ahbarandco-db` mapped to `127.0.0.1:15432`.

To verify the container is active and healthy:
```bash
docker ps --filter "name=ahbarandco-db"
```

---

### Step 4: Apply Database Schema & Migrations

Push the Prisma models to your local database container (or apply migration history):

```bash
npm run db:push
```

The database migrations are preserved in `prisma/migrations/`. You can also verify migration status with:
```bash
npx prisma migrate status
```

---

### Step 5: VPS Data Sync Warning & Synthetic Test Data Setup

> [!CAUTION]
> **Production Data Security Notice:**
> Production data **must never** be copied or included in the shared task archive or shared developer workspace. Use **synthetic test data** for local development.
>
> In particular, **do not include**:
> - `vps_dump.sql` (or any production database dumps)
> - Production customer records (names, emails, delivery addresses, phone numbers, order histories)
> - Private uploaded customer files or uploaded customer media
> - Production `.env` files or real production credentials

#### Setting Up Synthetic Test Data

1. **Inspect / Populate with Prisma Studio:**
   Inspect your local database and safely add mock catalog items (categories, collections, and products) using Prisma's visual GUI:
   ```bash
   npm run db:studio
   ```
   *(Opens at [http://localhost:5555](http://localhost:5555))*.

2. **Create a Local Test User:**
   - Navigate to [http://localhost:3000/register](http://localhost:3000/register) to register a test customer.
   - To promote this test user to an admin (for testing `/admin`), open Prisma Studio, locate the user in the `User` table, and change their `role` column from `"customer"` to `"admin"`.

---

### Step 6: Start the Development Server

Start Next.js in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Any code changes will hot-reload automatically.

---

## Helpful Commands Reference

| Task | Command | Description |
| --- | --- | --- |
| **Start Next.js dev server** | `npm run dev` | Runs Next.js at `localhost:3000` |
| **Start local DB** | `npm run docker:up` | Boots PostgreSQL container |
| **Stop local DB** | `npm run docker:down` | Shuts down PostgreSQL container |
| **View local DB logs** | `npm run docker:logs` | Follows PostgreSQL logs |
| **Update DB schema** | `npm run db:push` | Syncs `schema.prisma` to local DB |
| **Open DB Studio** | `npm run db:studio` | Web GUI for database browsing at `localhost:5555` |
| **Re-generate Prisma client** | `npm run db:generate` | Rebuilds Prisma client types |
| **Production build check** | `npm run build` | Verifies build and types compile cleanly |

---

## Troubleshooting

- **Database connection error (`P1001: Can't reach database server`)**:
  - Check if the container is running: `docker ps`.
  - If stopped, run `npm run docker:up`.
  - Confirm `DATABASE_URL` in `.env` uses port `15432` and not `5432`.
- **Missing Prisma client types (`Cannot find module '../src/generated/prisma'`)**:
  - Run `npm run db:generate`.
- **Port 3000 already in use**:
  - Run Next.js on a different port: `npx next dev -p 3001`.
