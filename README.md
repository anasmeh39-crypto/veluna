# Veluna — متجر العناية بالجسم

Veluna is a Moroccan DTC beauty store selling hair removal oil and under-skin hair cream. Built as a full-stack Next.js 14 app with COD checkout, Arabic RTL UI, a built-in Postgres order management system, and admin-configured ad tracking for Meta, TikTok and Snapchat.

> **Brand rule:** Veluna is 100% separate from Nuraskin. Never mix code, data, or infrastructure between the two brands.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via `pg` (file-based fallback store if unreachable) |
| Auth | Cookie-based (admin only) |
| Deployment | Easypanel on Hostinger VPS |

---

## Project Structure

```
veluna/
├── frontend/               # Full-stack Next.js app
│   ├── app/
│   │   ├── api/            # API routes (orders, admin auth)
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── checkout/       # COD checkout page
│   │   ├── products/       # Product detail pages
│   │   ├── packs/          # Bundle packs page
│   │   └── thank-you/      # Post-order confirmation
│   ├── components/         # Reusable UI components
│   ├── context/            # Cart + tracking state (React Context)
│   ├── lib/
│   │   ├── db.ts           # Postgres pool, schema/migrations + order CRUD
│   │   ├── order-fallback.ts    # Emergency store when Postgres is down
│   │   ├── products.ts     # Frontend product catalog
│   │   ├── backend-products.ts  # Server-side price source of truth
│   │   ├── delivery.ts     # Delivery fee logic by city
│   │   └── tracking/       # Ad tracking: adapters, hashing, dispatch
│   ├── tests/              # Vitest unit tests
│   ├── Dockerfile          # For Easypanel deployment
│   └── middleware.ts       # Admin route protection
├── backend/
│   ├── ADVERTISING.md
│   ├── EASYPANEL_DEPLOYMENT.md
│   ├── DATABASE.md
│   ├── BACKEND.md
│   └── FRONTEND.md
├── .env.example            # Copy to frontend/.env.local for local dev
├── .gitignore
└── README.md
```

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/veluna.git
cd veluna/frontend
npm install
```

### 2. Set up environment variables

```bash
cp ../.env.example .env.local
# Then edit .env.local with your values
```

### 3. Run the dev server

```bash
npm run dev
# Open http://localhost:3000
```

Tables are created automatically on first request against `DATABASE_URL`. If Postgres is unreachable, orders fall back to a JSON file so none are ever lost.

---

## Commands

```bash
# From veluna/frontend/

npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run typecheck # TypeScript, app + tests
npm test          # Vitest unit tests
```

---

## Production Deployment

See [backend/EASYPANEL_DEPLOYMENT.md](backend/EASYPANEL_DEPLOYMENT.md) for full step-by-step Easypanel instructions.

**Summary:**
- Deploy `frontend/` as a single app service on Easypanel
- Point `DATABASE_URL` at the Postgres service
- Set the 5 required environment variables
- Connect domain `veluna.ma`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | Yes | Password for /admin login |
| `ADMIN_SECRET_TOKEN` | Yes | Random secret for session cookie |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Yes | WA number (no + or spaces) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full site URL |
| `NEXT_PUBLIC_META_PIXEL_ID` | No | Legacy Facebook Pixel ID — superseded by /admin/advertising |
| `AD_TRACKING_ENCRYPTION_KEY` | For ads | AES-256-GCM key for advertising access tokens — `openssl rand -hex 32` |

Generate `ADMIN_SECRET_TOKEN` with: `openssl rand -hex 32`

---

## Admin Dashboard

URL: `https://veluna.ma/admin`

- View and manage all orders
- Filter by status: new / confirmed / shipped / delivered / cancelled / returned
- Update order status
- Profit calculator at `/admin/profit-calculator`
- Advertising & pixels at `/admin/advertising`
- Protected by `ADMIN_PASSWORD` cookie session

---

## Advertising & Pixels

Meta, TikTok and Snapchat browser pixels **and** their server-side conversions
APIs are configured from `/admin/advertising` — no code changes, no pasted
snippets. Access tokens are encrypted at rest with AES-256-GCM and never reach
the browser.

Requires `AD_TRACKING_ENCRYPTION_KEY` in the server environment. Full setup,
schema, event lifecycle, hashing rules and the QA checklist:
[backend/ADVERTISING.md](backend/ADVERTISING.md).

---

## Key Business Rules

- All orders are **Cash on Delivery (COD)**
- Delivery is free on orders ≥ 299 MAD
- Prices are recalculated **server-side** on every order (not trusted from client)
- Safe beauty claims only — no medical claims, no permanent results promised
