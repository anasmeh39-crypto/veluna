# Veluna — Advertising & Pixels

Server-side + browser tracking for Meta, TikTok and Snapchat, configured from
`/admin/advertising`. No JavaScript snippets are ever pasted by hand: the store
owner enters IDs and tokens, and the app injects the right pixel and calls the
right conversions API.

---

## 1. Setup

### 1.1 Environment

| Variable | Required | Scope | Purpose |
|---|---|---|---|
| `AD_TRACKING_ENCRYPTION_KEY` | **Yes**, to store any access token | Server only | AES-256-GCM key for encrypting tokens at rest. 32 bytes: `openssl rand -hex 32` (64 hex chars) or a 32-byte base64 string. |
| `DATABASE_URL` | Yes | Server only | Postgres. Holds `ad_settings` and `tracking_events`. |
| `ADMIN_SECRET_TOKEN` | Yes | Server only | Already used by `/admin`; also guards the advertising API routes. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Browser | Used to build `event_source_url` for server-side events. |
| `NEXT_PUBLIC_META_PIXEL_ID` | No (legacy) | Browser | Pre-admin Meta pixel. Used only when the admin has not set one. |
| `META_ACCESS_TOKEN` | No (legacy) | Server only | Fallback Meta CAPI token when none is stored in the admin. |
| `META_TEST_EVENT_CODE` | No (legacy) | Server only | Fallback Meta test event code. |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | No (legacy) | Browser | Fallback TikTok pixel code. |
| `TIKTOK_ACCESS_TOKEN` | No (legacy) | Server only | Fallback TikTok Events API token. |
| `SNAPCHAT_ACCESS_TOKEN` | No (legacy) | Server only | Fallback Snapchat CAPI token. |

**Admin configuration always wins over the legacy environment values.**

Never put an access token in a `NEXT_PUBLIC_` variable — those are inlined into
the browser bundle at build time.

If `AD_TRACKING_ENCRYPTION_KEY` is missing, saving a token returns HTTP 500 with
an explicit configuration error and writes nothing. Everything else keeps
working; only server-side conversions are unavailable.

### 1.2 Where to find each credential

| Platform | Browser | Server |
|---|---|---|
| Meta | Events Manager → Data Sources → your pixel → *Pixel ID* | Events Manager → Settings → *Generate access token* |
| TikTok | Events Manager → your pixel → *Pixel Code* | Events Manager → Settings → *Generate access token* |
| Snapchat | Ads Manager → Events Manager → *Pixel ID* | Ads Manager → Conversions API → *Generate token* |

### 1.3 Turning it on

1. Deploy with `AD_TRACKING_ENCRYPTION_KEY` set.
2. Open `/admin/advertising`.
3. Per platform: toggle the browser pixel, paste the ID, save.
4. Per platform: toggle the server API, paste the token, save.
5. Press **بعثي حدث تجريبي** (send test event) and confirm it in the platform's
   own tooling (Meta Test Events, TikTok Events Manager diagnostics, Snapchat
   validation).

---

## 2. Database changes

All migrations are additive and run automatically on first use. No existing row
is rewritten or dropped.

### 2.1 `orders` — new columns

`ALTER TABLE orders ADD COLUMN IF NOT EXISTS …` in `frontend/lib/db.ts`:

| Column | Type | Purpose |
|---|---|---|
| `utm_term` | `VARCHAR(100)` | Completes the UTM set. |
| `ttclid` | `VARCHAR(255)` | TikTok click id. |
| `sccid` | `VARCHAR(255)` | Snapchat click id (`ScCid`). |
| `fbp` | `VARCHAR(255)` | Meta browser cookie. |
| `fbc` | `VARCHAR(255)` | Meta click cookie. |
| `ttp` | `VARCHAR(255)` | TikTok cookie. |
| `scid` | `VARCHAR(255)` | Snapchat first-party cookie. |
| `landing_page` | `TEXT` | First page of the session. |
| `referrer` | `TEXT` | Original referrer. |

Existing orders keep their data and get `NULL` in the new columns.

### 2.2 `ad_settings` — new table

Single row (`id = 'default'`) holding the whole configuration as JSON, with
access tokens already encrypted inside it.

```sql
CREATE TABLE IF NOT EXISTS ad_settings (
  id         VARCHAR(20)  PRIMARY KEY,
  config     TEXT         NOT NULL,
  updated_at VARCHAR(30)  NOT NULL
);
```

### 2.3 `tracking_events` — new table

Idempotency ledger and diagnostics source.

```sql
CREATE TABLE IF NOT EXISTS tracking_events (
  event_key   VARCHAR(160) PRIMARY KEY,  -- platform:event:event_id
  order_id    VARCHAR(20),
  platform    VARCHAR(20)  NOT NULL,
  event_name  VARCHAR(40)  NOT NULL,
  event_id    VARCHAR(120) NOT NULL,
  status      VARCHAR(20)  NOT NULL,     -- pending | sent | failed
  attempts    INTEGER      NOT NULL DEFAULT 1,
  error       TEXT,                      -- truncated, no secrets or PII
  created_at  VARCHAR(30)  NOT NULL,
  updated_at  VARCHAR(30)  NOT NULL
);
```

Rollback is `DROP TABLE ad_settings, tracking_events;` plus dropping the nine
order columns — orders themselves are untouched either way.

---

## 3. Event lifecycle

| Event | Where it fires | Trigger |
|---|---|---|
| `PageView` | Browser | Once per navigation, driven by React (the vendor snippets' automatic PageView is removed so it cannot double-fire). |
| `ViewContent` | Browser | Product page mount, once per product. |
| `AddToCart` | Browser | Inside `CartContext.addItem` plus the three `setCart` paths (offer selector, upsell). Never on a re-render. |
| `InitiateCheckout` | Browser | Checkout page mount, guarded by a cart signature in `sessionStorage`. |
| `Purchase` | **Browser + server** | Browser on `/thank-you` after the order loads; server in `POST /api/orders` after the order is persisted. |
| `OrderConfirmed` / `OrderShipped` / `OrderDelivered` / `OrderCancelled` / `OrderReturned` | Server only | Admin status change in `PATCH /api/orders/[id]/status`. |

### 3.1 Deduplication

Every event carries one id shared by the browser and the server:

```
Purchase   → vl-purchase-<orderId>
Lifecycle  → vl-<status>-<orderId>
Funnel     → vl-<event>-<uuid>   (browser only, nothing to dedupe against)
```

The Purchase id is *derived* from the order id, so both sides compute the same
string without coordinating.

| Platform | Browser field | Server field |
|---|---|---|
| Meta | `fbq('track','Purchase', payload, { eventID })` | `data[].event_id` |
| TikTok | `ttq.track(name, props, { event_id })` | `data[].event_id` |
| Snapchat | `client_dedup_id` in the pixel payload | `data[].event_id` |

Three independent layers stop a duplicate Purchase:

1. **In-memory ref** — React re-renders cannot re-fire it.
2. **`localStorage` (`veluna_purchase_<orderId>`)** — refreshing `/thank-you`
   does not send a second browser event.
3. **`tracking_events` claim** — the server inserts the event key with
   `ON CONFLICT … WHERE status <> 'sent'`. A successful send can never be
   claimed twice; a *failed* one can be retried. If Postgres is unreachable the
   claim falls back to a bounded in-memory set, and the shared `event_id` still
   lets the platforms dedupe.

### 3.2 Failure behaviour

- Dispatch is `Promise.allSettled` per platform: one failure never affects the others.
- Every HTTP call has a 6-second timeout.
- The dispatcher never throws; order creation is never awaited on it.
- Failures are recorded in `tracking_events` and surfaced in the admin UI.

---

## 4. Normalization and hashing

Server-side only. Raw values never reach the browser or the logs.

### 4.1 Phone

Input from Moroccan customers arrives as `06XXXXXXXX`, `07XXXXXXXX`,
`+2126XXXXXXXX`, `002126XXXXXXXX`, or with spaces / dashes / parentheses. It is
first canonicalised to E.164 `+212XXXXXXXXX`, then adapted per platform:

| Platform | Format sent to SHA-256 | Example |
|---|---|---|
| Meta | country code, digits only, **no `+`** | `212612345678` |
| TikTok | E.164 **with `+`** | `+212612345678` |
| Snapchat | country code, digits only, **no `+`** | `212612345678` |

TikTok's hash therefore differs from the other two for the same customer. This
is intentional and enforced by tests — using one rule everywhere silently
destroys TikTok match rates.

### 4.2 Other fields

| Field | Normalization | Hashed? |
|---|---|---|
| Email | trim + lowercase | Yes |
| First / last name | lowercase, punctuation and spaces removed, Arabic preserved | Yes |
| City | same as name | Yes |
| Country | fixed `ma` | Yes |
| External ID | phone as supplied | Yes |
| IP address | none | **No** — platforms require it raw |
| User agent | none | **No** — platforms require it raw |
| `fbp` / `fbc` / `ttclid` / `ttp` / `sc_click_id` / `sc_cookie1` | none | **No** — opaque identifiers |

---

## 5. COD conversion model

Veluna is cash-on-delivery, so "purchase" is ambiguous: an order is *submitted*
long before money changes hands. The milestone is configurable in the admin UI.

| Milestone | Purchase fires | Trade-off |
|---|---|---|
| `order_created` (**default**) | Immediately after `POST /api/orders` succeeds | Fastest signal and the only one that lands inside the platforms' click-attribution windows, so the algorithms actually learn. Includes orders that later cancel — expect reported conversions to exceed delivered revenue by the cancellation rate. |
| `confirmed` | When the admin marks the order confirmed | Cleaner, but hours late. |
| `delivered` | When the admin marks the order delivered | Matches real revenue, but days late — usually outside the attribution window, which starves optimisation. |

Whatever the setting:

- **Exactly one Purchase per order.** The event id is the same in all three
  cases, so switching the milestone cannot produce a second one for an order
  that already converted.
- `custom_data.order_status` carries the order's status (`new`, `delivered`, …)
  so campaigns can be segmented without a second Purchase.
- Lifecycle events are **separate** custom events, never a replacement Purchase.

Recommendation: keep `order_created` for optimisation and use
`/admin/profit-calculator` plus the delivered-order lifecycle events for true
profitability. Only move the milestone if your cancellation rate is so high that
the platforms are optimising towards bad orders.

---

## 6. Security

- Access tokens are stored AES-256-GCM encrypted; the key lives only in
  `AD_TRACKING_ENCRYPTION_KEY`.
- The browser is only ever served `{ enabled, id }` per platform via
  `GET /api/tracking/config`. No endpoint returns a token.
- The admin API returns `••••••••` plus the last 4 characters. Submitting an
  empty token field keeps the stored value; submitting `__CLEAR__` deletes it.
- Admin routes verify the `admin_token` cookie with a constant-time comparison.
- Platform calls happen only from server route handlers.
- Logs contain platform, event name and a truncated error string — never
  tokens, payloads, or raw customer data.

---

## 7. Manual QA checklist

Run against a deployed environment with a real database.

**No configuration**
- [ ] Open the homepage with nothing configured → no pixel scripts in the
      Network tab, no console errors, page renders normally.
- [ ] `GET /api/tracking/config` returns all three platforms `enabled: false`.

**Meta only**
- [ ] Configure Meta pixel + CAPI, save, reload the storefront.
- [ ] `connect.facebook.net/en_US/fbevents.js` loads; TikTok and Snapchat do not.
- [ ] Navigate home → product → packs → home: exactly one `PageView` per
      navigation, and only one `fbevents.js` script tag in the DOM.
- [ ] Product page fires one `ViewContent` with the right content id and price.
- [ ] "زيدي للطلب" fires exactly one `AddToCart`; clicking again fires one more.
      Scrolling or re-rendering fires none.
- [ ] Reaching `/checkout` fires one `InitiateCheckout`; refreshing does not
      fire a second one.

**All three platforms**
- [ ] Configure TikTok and Snapchat too; all three scripts load, each exactly once.
- [ ] Press *send test event* on each card → success, and the event appears in
      Meta Test Events / TikTok diagnostics / Snapchat validation.

**Disable one**
- [ ] Turn Meta's browser pixel off, keep CAPI on → `fbevents.js` no longer
      loads, but a submitted order still reaches Meta server-side.

**Order flow**
- [ ] Land on the site with
      `?utm_source=facebook&utm_campaign=test&fbclid=ABC&ttclid=DEF&ScCid=GHI`.
- [ ] Navigate around, then submit a COD order.
- [ ] `/admin/orders` shows the order; the row in Postgres has `utm_source`,
      `fbclid`, `ttclid`, `sccid`, `fbp`, `landing_page` and `referrer` filled in.
- [ ] `/admin/advertising` → *recent events* shows one `Purchase` per configured
      platform, status `sent`.
- [ ] Refresh `/thank-you?order=…` five times → still exactly one Purchase per
      platform in `tracking_events`, and no repeated browser Purchase in the
      Network tab.
- [ ] Move the order to *confirmed* then *delivered* in the admin → lifecycle
      events appear, and no second Purchase.

**Safety**
- [ ] `grep` the server logs for the access token, a customer phone number and a
      customer name → no hits.
- [ ] View source / inspect the JS bundle for the access token → no hits.
- [ ] Enable an ad blocker and submit an order → checkout still completes and
      the server-side Purchase still lands.
- [ ] Stop Postgres and load the storefront → pages render, no pixels, no errors
      shown to the customer.

---

## 8. File map

```
frontend/lib/tracking/
  types.ts        shared types + browser-safe projections
  hash.ts         normalization + SHA-256 (per-platform rules)
  crypto.ts       AES-256-GCM encrypt/decrypt/mask
  settings.ts     persistence, validation, masking, legacy env
  log.ts          tracking_events: idempotency claim + diagnostics
  events.ts       event ids + canonical event from a server order
  adapter.ts      PlatformAdapter contract
  meta.ts         Meta CAPI adapter
  tiktok.ts       TikTok Events API adapter
  snapchat.ts     Snapchat CAPI v3 adapter
  http.ts         timeout-bounded POST helper
  server.ts       dispatcher, order hooks, request attribution
  browser.ts      browser payload builders + guarded dispatch
  attribution.ts  first/last-touch capture, cookie reads

frontend/components/TrackingScripts.tsx   pixel injection (next/script)
frontend/components/TrackViewContent.tsx  product-page ViewContent
frontend/context/TrackingContext.tsx      config fetch, PageView, useTracking()

frontend/app/api/tracking/config          public: ids + flags only
frontend/app/api/admin/advertising        admin: read / save settings
frontend/app/api/admin/advertising/test   admin: send a test event
frontend/app/admin/advertising            admin UI
```
