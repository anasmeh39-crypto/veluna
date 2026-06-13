# Easypanel Deployment — Veluna

Veluna is a **single full-stack Next.js app** (Case B). One service, one volume, one domain.

---

## Prerequisites

- Easypanel running on your Hostinger VPS
- GitHub repo: `github.com/YOUR_USERNAME/veluna` (pushed and public or connected)
- Domain `veluna.ma` pointed to your VPS IP (A record)
- Secrets ready:
  - A strong `ADMIN_PASSWORD`
  - A random `ADMIN_SECRET_TOKEN` — generate with: `openssl rand -hex 32`

---

## Step 1 — Create a new Easypanel Project

1. Open Easypanel → click **"New Project"**
2. Name: `veluna`
3. Click **Create**

---

## Step 2 — Create the App Service

1. Inside the `veluna` project → click **"+ Service"** → choose **"App"**
2. Name: `veluna-store`
3. Click **Create**

---

## Step 3 — Connect GitHub

1. In the `veluna-store` service → go to **"Source"** tab
2. Connect your GitHub account if not already connected
3. Select repository: `veluna`
4. Branch: `main`
5. **Root directory:** `frontend`
6. Click **Save**

---

## Step 4 — Configure Build & Start

In the **"Build"** tab:

| Setting | Value |
|---|---|
| Build type | **Dockerfile** |
| Dockerfile path | `Dockerfile` (relative to root dir `frontend/`) |

> Easypanel will use `frontend/Dockerfile` to build the image.
> This handles native module compilation for `better-sqlite3` automatically.

---

## Step 5 — Set Environment Variables

In the **"Environment"** tab, add these variables:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | Your chosen admin password |
| `ADMIN_SECRET_TOKEN` | Output of `openssl rand -hex 32` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Your WA number, e.g. `212612345678` |
| `NEXT_PUBLIC_SITE_URL` | `https://veluna.ma` |
| `NEXT_PUBLIC_META_PIXEL_ID` | Your Pixel ID (or leave empty) |
| `NODE_ENV` | `production` |

Click **Save**.

---

## Step 6 — Add a Persistent Volume for SQLite

> This is critical. Without a volume, your orders database is wiped every time the app restarts.

1. In the `veluna-store` service → go to **"Mounts"** (or "Volumes") tab
2. Click **"+ Add Volume"**
3. Set:
   - **Volume name:** `veluna-data`
   - **Mount path in container:** `/app/data`
4. Click **Save**

This mounts a persistent disk at `/app/data`, which is where `data/veluna.db` lives.

---

## Step 7 — Configure Domain

1. Go to the **"Domains"** tab
2. Click **"+ Add Domain"**
3. Add: `veluna.ma`
4. Also add: `www.veluna.ma` → redirect to `veluna.ma`
5. Enable **HTTPS / Let's Encrypt** (Easypanel handles this automatically)

---

## Step 8 — Deploy

1. Click **"Deploy"** (or push to GitHub — Easypanel auto-deploys on push if configured)
2. Watch the build logs for any errors
3. Build takes ~2-4 minutes (native module compilation)
4. Once green → open `https://veluna.ma`

---

## Step 9 — Verify the Deployment

Run these checks after deploy:

```bash
# 1. Homepage loads
curl -I https://veluna.ma

# 2. Products API
curl https://veluna.ma/api/products

# 3. Admin login page loads
curl -I https://veluna.ma/admin/login

# 4. Test order submission (replace with real values)
curl -X POST https://veluna.ma/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "فاطمة الزهراء",
    "phone": "0612345678",
    "city": "الدار البيضاء",
    "address": "حي المعاريف، شارع محمد الخامس",
    "items": [{"id": "zit-manaa", "quantity": 1}]
  }'
```

Expected: `{"order": {"id": "VL...", "status": "new", ...}}`

---

## Updating the App

Every push to the `main` branch triggers an automatic redeploy on Easypanel (if webhook is configured). Alternatively, click **"Deploy"** manually in the Easypanel UI.

The SQLite database persists across deployments because it's on the mounted volume.

---

## Rollback

If a deploy breaks the site:
1. Go to the `veluna-store` service → **"Deployments"** tab
2. Find the last working deployment
3. Click **"Rollback"**

The database is unaffected by rollbacks (it's on the volume, not the container).

---

## Port Reference

| Service | Internal Port |
|---|---|
| Next.js app | `3000` |

Easypanel's reverse proxy handles SSL termination and routes `veluna.ma → :3000` automatically.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `better-sqlite3` build error | Make sure the Dockerfile is used (not nixpacks) |
| `/app/data` is empty after restart | Volume not mounted — re-check Step 6 |
| Admin login fails | Check `ADMIN_PASSWORD` and `ADMIN_SECRET_TOKEN` env vars |
| Orders not saving | Check volume is mounted at `/app/data` and writable |
| 500 on `/api/orders` | Check build logs; `better-sqlite3` may have failed to compile |
