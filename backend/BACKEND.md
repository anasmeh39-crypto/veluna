# Backend — Veluna API

The backend is built into the Next.js app as **API Routes** under `frontend/app/api/`.
No separate server process is needed.

---

## API Routes Summary

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Public | Submit a new COD order |
| `GET` | `/api/orders` | Admin cookie | List all orders (paginated, filterable) |
| `GET` | `/api/orders/[id]` | Admin cookie | Get a single order by ID |
| `PATCH` | `/api/orders/[id]/status` | Admin cookie | Update order status |
| `GET` | `/api/orders/[id]/public` | None (token) | Order confirmation for thank-you page |
| `GET` | `/api/products` | Public | List active products with prices |
| `POST` | `/api/admin/login` | None | Log in to admin (sets cookie) |
| `POST` | `/api/admin/logout` | None | Clear admin cookie |

---

## POST /api/orders

Submit a new order. Prices are **always recalculated server-side**.

**Request body:**

```json
{
  "customer_name": "فاطمة الزهراء",
  "phone": "0612345678",
  "city": "الدار البيضاء",
  "address": "حي المعاريف، شارع محمد الخامس",
  "items": [
    { "id": "zit-manaa", "quantity": 1 },
    { "id": "krim-jlid", "quantity": 1 }
  ],
  "notes": "ملاحظة اختيارية",
  "source": "website",
  "utm_source": "facebook",
  "utm_medium": "paid",
  "utm_campaign": "ramadan-2026"
}
```

**Success response (HTTP 201):**

```json
{
  "order": {
    "id": "VL260612-A3B2",
    "customer_name": "فاطمة الزهراء",
    "phone": "0612345678",
    "city": "الدار البيضاء",
    "address": "حي المعاريف، شارع محمد الخامس",
    "items": [
      { "id": "zit-manaa", "name_ar": "زيت إزالة الشعر", "price_mad": 149, "quantity": 1 },
      { "id": "krim-jlid", "name_ar": "كريم الشعر تحت الجلد", "price_mad": 129, "quantity": 1 }
    ],
    "subtotal": 278,
    "delivery_fee": 20,
    "total": 298,
    "payment_method": "cod",
    "status": "new",
    "created_at": "2026-06-12T10:00:00.000Z"
  }
}
```

**Validation errors (HTTP 422):**

```json
{ "errors": ["دخلي الاسم الكامل", "دخلي رقم الهاتف صحيح"] }
```

**Test with curl:**

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "فاطمة الزهراء",
    "phone": "0612345678",
    "city": "الدار البيضاء",
    "address": "حي المعاريف، شارع محمد الخامس",
    "items": [{"id": "zit-manaa", "quantity": 1}]
  }'
```

---

## GET /api/products

Returns all active products with prices.

**Response:**

```json
{
  "products": [
    { "id": "zit-manaa", "slug": "zit-manaa", "name_ar": "زيت إزالة الشعر", "price_mad": 149, "compare_at_price_mad": 179, "product_type": "single", "active": true },
    { "id": "krim-jlid", "slug": "krim-jlid", "name_ar": "كريم الشعر تحت الجلد و جلد الوزة", "price_mad": 129, "compare_at_price_mad": 159, "product_type": "single", "active": true }
  ]
}
```

---

## GET /api/orders (Admin)

Requires admin cookie (`admin_token`). Lists orders with optional filters.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by status: `new`, `confirmed`, `shipped`, `delivered`, `cancelled`, `returned` |
| `search` | string | Search by name, phone, or order ID |
| `limit` | number | Max results (default 50, max 200) |
| `offset` | number | Pagination offset |

---

## PATCH /api/orders/[id]/status (Admin)

Update an order's status.

```bash
curl -X PATCH http://localhost:3000/api/orders/VL260612-A3B2/status \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_token=YOUR_ADMIN_SECRET_TOKEN" \
  -d '{"status": "confirmed"}'
```

---

## Admin Authentication

Login posts to `/api/admin/login` with `{ password }`.
On success, a `httpOnly` cookie `admin_token` is set with the value of `ADMIN_SECRET_TOKEN`.
All admin API routes check this cookie.
Middleware at `frontend/middleware.ts` protects all `/admin/*` pages.

---

## Price Calculation

Prices are defined in `frontend/lib/backend-products.ts`.
On every `POST /api/orders`, the server:
1. Looks up each `item.id` in `BACKEND_PRODUCTS`
2. Rejects unknown or inactive products
3. Recalculates `subtotal = sum(price_mad × quantity)`
4. Adds `delivery_fee` from `lib/delivery.ts` based on city

The client-submitted `price` is **ignored** — always server-side.

---

## Order Status Flow

```
new → confirmed → shipped → delivered
                           ↘ returned
         ↘ cancelled
```

---

## Required Environment Variables

| Variable | Used in |
|---|---|
| `ADMIN_PASSWORD` | `/api/admin/login` — verifies login |
| `ADMIN_SECRET_TOKEN` | All admin routes — cookie value |
| `NODE_ENV` | Cookie `secure` flag (only HTTPS in production) |

---

## Delivery Fee Logic

Defined in `frontend/lib/delivery.ts`.

- Free delivery on orders ≥ **299 MAD**
- Per-city fees: Casablanca 20 MAD, Rabat 25 MAD, etc.
- Unknown cities: **35 MAD**

To change delivery fees, edit `CITY_FEES` in `frontend/lib/delivery.ts`.

---

## Updating Product Prices

Edit `frontend/lib/backend-products.ts` — this is the **server-side source of truth**.
Also update `frontend/lib/products.ts` (frontend display data) to keep them in sync.

After any price change:
1. Edit both files
2. `npm run build`
3. Redeploy
