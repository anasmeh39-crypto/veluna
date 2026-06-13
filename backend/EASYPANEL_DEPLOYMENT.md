# Easypanel Deployment — Veluna

## Architecture

Veluna is a **single Next.js 14 app**. There is no separate backend server.
The same app handles store pages, API routes, and the admin dashboard.

```
GitHub repo (veluna)
        │
        ▼
Easypanel service: "backend"   ← ONE service only
        │
        ├── Store pages        (veluna.ma, veluna.ma/products/*, etc.)
        ├── API routes         (veluna.ma/api/orders, veluna.ma/api/products)
        └── Admin dashboard    (veluna.ma/admin)
```

**Port: 3000** — set this in the Easypanel service port field.

---

## Services in Easypanel

| Service | Status | Reason |
|---|---|---|
| `backend` | ✅ Keep | Runs the full Next.js app |
| `frontend` | ❌ Delete | Duplicate — same app, not needed |
| `veluna-db` | ⏳ Keep | PostgreSQL ready for future migration from SQLite |

---

## Step 1 — Source Settings

In Easypanel → veluna → backend → **Source** tab:

| Setting | Value |
|---|---|
| Repository | `anasmeh39-crypto/veluna` |
| Branch | `main` |
| **Root directory** | `frontend` |
| Build type | **Dockerfile** |
| Dockerfile path | `Dockerfile` |

---

## Step 2 — Port

In Easypanel → veluna → backend → **General** tab:

| Setting | Value |
|---|---|
| **Port** | `3000` |

---

## Step 3 — Environment Variables

In Easypanel → veluna → backend → **Environment** tab.

### Required (app will not start without these)

```
NODE_ENV=production
ADMIN_PASSWORD=your-strong-admin-password
ADMIN_SECRET_TOKEN=output-of-openssl-rand-hex-32
NEXT_PUBLIC_SITE_URL=https://veluna.ma
NEXT_PUBLIC_WHATSAPP_NUMBER=212612345678
```

Generate `ADMIN_SECRET_TOKEN` on your VPS: `openssl rand -hex 32`

### Optional — add when ready

```
NEXT_PUBLIC_META_PIXEL_ID=
META_ACCESS_TOKEN=
META_TEST_EVENT_CODE=

NEXT_PUBLIC_TIKTOK_PIXEL_ID=
TIKTOK_ACCESS_TOKEN=

GOOGLE_SHEETS_WEBHOOK_URL=
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_JSON=

LOG_LEVEL=INFO
```

### Future — PostgreSQL (not needed now, SQLite is active)

```
DATABASE_URL=postgres://postgres:PASSWORD@veluna-db:5432/veluna?sslmode=disable
```

---

## Step 4 — Persistent Volume (SQLite)

In Easypanel → veluna → backend → **Mounts** tab:

| Setting | Value |
|---|---|
| Volume name | `veluna-data` |
| **Mount path** | `/app/data` |

Without this volume, all orders are lost every time the container restarts.

---

## Step 5 — Domain

In Easypanel → veluna → backend → **Domains** tab:

- Add `veluna.ma` → enable HTTPS
- Add `www.veluna.ma` → redirect to `veluna.ma`

---

## Step 6 — Deploy

Click **Deploy**. Build takes ~3 minutes.

After deploy, verify:

```bash
# Homepage
curl -I https://veluna.ma

# Products API
curl https://veluna.ma/api/products

# Test order submission
curl -X POST https://veluna.ma/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "فاطمة الزهراء",
    "phone": "0612345678",
    "city": "الدار البيضاء",
    "address": "حي المعاريف",
    "items": [{"id": "zit-manaa", "quantity": 1}]
  }'
```

---

## Startup Failure: Missing Env Vars

If `ADMIN_PASSWORD` or `ADMIN_SECRET_TOKEN` are missing, the app refuses to start:

```
[Veluna] Missing required environment variables: ADMIN_PASSWORD, ADMIN_SECRET_TOKEN
Add them in Easypanel → veluna → backend → Environment tab.
```

Fix: add the missing variables in Easypanel and redeploy.

---

## Updating the Store

Every `git push origin main` triggers an automatic redeploy.
The database at `/app/data/veluna.db` is on the persistent volume — unaffected by redeploys.

---

## Troubleshooting

| Error | Fix |
|---|---|
| `open Dockerfile: no such file or directory` | Root directory must be `frontend` |
| `/app/public: not found` | Run `git add frontend/public/ && git push` |
| `Missing required environment variables` | Add `ADMIN_PASSWORD` + `ADMIN_SECRET_TOKEN` in Easypanel |
| Orders lost after restart | Volume not mounted at `/app/data` — check Mounts tab |
| Admin login fails | Verify `ADMIN_PASSWORD` and `ADMIN_SECRET_TOKEN` are set correctly |
