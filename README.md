# Veluna — متجر العناية بالجسم

Veluna is a Moroccan DTC beauty store selling hair removal oil and under-skin hair cream. Built as a full-stack Next.js 14 app with COD checkout, Arabic RTL UI, and a built-in SQLite order management system.

> **Brand rule:** Veluna is 100% separate from Nuraskin. Never mix code, data, or infrastructure between the two brands.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via `better-sqlite3` |
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
│   ├── context/            # Cart state (React Context)
│   ├── lib/
│   │   ├── db.ts           # SQLite database + order CRUD
│   │   ├── products.ts     # Frontend product catalog
│   │   ├── backend-products.ts  # Server-side price source of truth
│   │   └── delivery.ts     # Delivery fee logic by city
│   ├── data/               # SQLite database file (gitignored, needs volume)
│   ├── Dockerfile          # For Easypanel deployment
│   └── middleware.ts       # Admin route protection
├── docs/
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

The SQLite database is created automatically at `frontend/data/veluna.db` on first request.

---

## Commands

```bash
# From veluna/frontend/

npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## Production Deployment

See [docs/EASYPANEL_DEPLOYMENT.md](docs/EASYPANEL_DEPLOYMENT.md) for full step-by-step Easypanel instructions.

**Summary:**
- Deploy `frontend/` as a single app service on Easypanel
- Mount a persistent volume at `/app/data` for SQLite
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
| `NEXT_PUBLIC_META_PIXEL_ID` | No | Facebook Pixel ID |

Generate `ADMIN_SECRET_TOKEN` with: `openssl rand -hex 32`

---

## Admin Dashboard

URL: `https://veluna.ma/admin`

- View and manage all orders
- Filter by status: new / confirmed / shipped / delivered / cancelled / returned
- Update order status
- Protected by `ADMIN_PASSWORD` cookie session

---

## Key Business Rules

- All orders are **Cash on Delivery (COD)**
- Delivery is free on orders ≥ 299 MAD
- Prices are recalculated **server-side** on every order (not trusted from client)
- Safe beauty claims only — no medical claims, no permanent results promised
