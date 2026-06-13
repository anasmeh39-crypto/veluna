# Database — Veluna

## Overview

Veluna uses **SQLite** via the `better-sqlite3` package. The database file is stored locally in `frontend/data/veluna.db`.

SQLite was chosen because:
- No external database service needed
- Zero-latency reads (same process)
- WAL mode allows concurrent reads
- Simple to back up (single file)
- Sufficient for hundreds of orders/day

---

## Database File Location

| Environment | Path |
|---|---|
| Local development | `frontend/data/veluna.db` |
| Production (Easypanel) | `/app/data/veluna.db` (inside container) |

The database is **auto-created on first request** — no manual migration needed.

---

## Setting Up in Easypanel

No separate database service is needed. The database is a file inside the app container.

**Critical:** Mount a persistent volume so the database survives container restarts:

- Volume name: `veluna-data`
- Mount path: `/app/data`

See [EASYPANEL_DEPLOYMENT.md](EASYPANEL_DEPLOYMENT.md) Step 6.

---

## Schema

### Table: `orders`

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Auto-generated: `VL250612-A3B2` |
| `customer_name` | TEXT | Customer's full name |
| `phone` | TEXT | Moroccan phone (normalized) |
| `city` | TEXT | Delivery city (Arabic) |
| `address` | TEXT | Full delivery address |
| `items` | TEXT | JSON array of order lines |
| `subtotal` | REAL | Items total before delivery (MAD) |
| `delivery_fee` | REAL | Delivery fee (MAD) |
| `total` | REAL | subtotal + delivery_fee (MAD) |
| `payment_method` | TEXT | Always `"cod"` |
| `status` | TEXT | See order statuses below |
| `notes` | TEXT | Optional customer note |
| `source` | TEXT | Traffic source (`"website"`) |
| `utm_source` | TEXT | UTM parameter |
| `utm_medium` | TEXT | UTM parameter |
| `utm_campaign` | TEXT | UTM parameter |
| `utm_content` | TEXT | UTM parameter |
| `fbclid` | TEXT | Facebook click ID |
| `user_agent` | TEXT | Browser user agent |
| `ip_address` | TEXT | Customer IP |
| `created_at` | TEXT | ISO 8601 timestamp |
| `updated_at` | TEXT | ISO 8601 timestamp |

### Items JSON format

Each `items` column stores a JSON array:

```json
[
  { "id": "zit-manaa", "name_ar": "زيت إزالة الشعر", "price_mad": 149, "quantity": 1 },
  { "id": "krim-jlid", "name_ar": "كريم الشعر تحت الجلد", "price_mad": 129, "quantity": 1 }
]
```

### Order Statuses

| Status | Meaning |
|---|---|
| `new` | Just placed — not yet confirmed |
| `confirmed` | Confirmed by phone call |
| `shipped` | Handed to delivery company |
| `delivered` | Customer received the order |
| `cancelled` | Order cancelled |
| `returned` | Customer returned the order |

---

## How Orders Are Stored

1. Customer fills checkout form → POST `/api/orders`
2. Server validates all fields + recalculates prices server-side
3. Calculates delivery fee based on city
4. Inserts a new row into `orders` table
5. Returns `{ order: { id, ... } }` with HTTP 201
6. Customer is redirected to `/thank-you?order=VL250612-A3B2`

Prices are **never trusted from the client** — they are always recalculated from `lib/backend-products.ts`.

---

## Viewing the Database

### Via admin dashboard

Open `https://veluna.ma/admin` — full order management UI.

### Via SQLite CLI (local)

```bash
cd frontend
sqlite3 data/veluna.db

# List all orders
SELECT id, customer_name, phone, city, total, status, created_at FROM orders ORDER BY created_at DESC;

# Count by status
SELECT status, COUNT(*) FROM orders GROUP BY status;

# Today's orders
SELECT * FROM orders WHERE date(created_at) = date('now');
```

### Via SQLite CLI (on VPS)

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Find the container
docker ps | grep veluna

# Enter the container
docker exec -it CONTAINER_ID sh

# Open the database
sqlite3 /app/data/veluna.db
```

---

## Backup

### Manual backup (recommended before any deploy)

```bash
# On your VPS, copy the database file out
docker cp CONTAINER_ID:/app/data/veluna.db ./veluna-backup-$(date +%Y%m%d).db
```

### Automated backup (optional)

Add a cron job on the VPS:

```bash
# Every day at 2am — backup to /root/veluna-backups/
0 2 * * * docker cp $(docker ps -qf "name=veluna") :/app/data/veluna.db /root/veluna-backups/veluna-$(date +\%Y\%m\%d).db
```

---

## Restore from Backup

```bash
# Stop the app briefly if possible, then:
docker cp veluna-backup-20260101.db CONTAINER_ID:/app/data/veluna.db
# Restart the container
docker restart CONTAINER_ID
```

---

## Isolation from Nuraskin

Veluna's database has **zero connection** to Nuraskin:
- Different VPS project in Easypanel (`veluna` vs `nuraskin`)
- Different database file path (`/app/data/veluna.db`)
- Different environment variables
- Never run queries that mix both datasets
