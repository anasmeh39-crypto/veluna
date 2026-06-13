# Frontend — Veluna Store

The frontend is a Next.js 14 App Router app with full RTL Arabic support, Tailwind CSS, and a React Context cart.

---

## Pages

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Homepage — Hero, Products grid, How-to, Testimonials, FAQ, CTA |
| `/products/zit-manaa` | `app/products/zit-manaa/page.tsx` | Oil product detail page |
| `/products/krim-jlid` | `app/products/krim-jlid/page.tsx` | Cream product detail page |
| `/packs` | `app/packs/page.tsx` | Bundle packs page |
| `/checkout` | `app/checkout/page.tsx` | COD checkout form |
| `/thank-you` | `app/thank-you/page.tsx` | Order confirmation |
| `/contact` | `app/contact/page.tsx` | Contact / support page |
| `/admin` | `app/admin/page.tsx` | Admin dashboard (orders) |
| `/admin/login` | `app/admin/login/page.tsx` | Admin login |
| `/admin/orders` | `app/admin/orders/page.tsx` | Orders list with filters |

---

## Components

### Layout components

| Component | Description |
|---|---|
| `ClientLayout.tsx` | Wraps all non-admin pages: CartProvider + Header + CartDrawer + Footer + WhatsAppFAB |
| `Header.tsx` | RTL nav with logo, product links, cart icon + item count |
| `Footer.tsx` | Links, brand info, legal disclaimer |
| `CartDrawer.tsx` | Slide-in cart panel (CSS transitions, always mounted), cross-sell upsell, WhatsApp order |
| `WhatsAppFAB.tsx` | Floating WhatsApp button (bottom-right, pulsing animation) |

### Product components

| Component | Description |
|---|---|
| `ProductCard.tsx` | Card used in product grids — image, name, price, add-to-cart |
| `ProductImage.tsx` | SVG illustrations for oil bottle and cream jar (deterministic gradient IDs) |
| `StickyMobileCart.tsx` | Slides up on mobile when the page CTA scrolls out of view |
| `UpsellSection.tsx` | Shown below product pages — suggests the complementary product |

### Section components (homepage)

| Component | Description |
|---|---|
| `sections/Hero.tsx` | Main hero with product images and social proof |
| `sections/ProductsGrid.tsx` | 2-column product cards grid |
| `sections/Routine.tsx` | Step-by-step routine section |
| `sections/TrustBadges.tsx` | COD, delivery, WhatsApp trust row |
| `sections/Testimonials.tsx` | Customer reviews |
| `sections/BundlePromo.tsx` | Pack/bundle promotional section |
| `sections/FAQ.tsx` | Accordion FAQ |
| `sections/Problems.tsx` | Pain points section |

---

## Product Data Location

### Frontend display data

`frontend/lib/products.ts` — contains all product info shown to customers:
- Name, tagline, description
- Benefits, how-to-use steps
- Warnings, ingredients
- FAQ, reviews count, rating
- Colors for SVG illustrations

### Server-side price data (source of truth)

`frontend/lib/backend-products.ts` — only prices and active status.
These are used to recalculate order totals server-side on every submission.

> If you change a price, update **both** files.

---

## Cart Flow

1. Customer adds product via **"أضيفي للسلة"** button
2. Cart state managed by `CartContext` (React `useReducer`)
3. Cart persists in component state (not localStorage — resets on tab close)
4. Cart drawer opens automatically on add
5. Smart cross-sell: if oil in cart → show cream upsell, and vice versa
6. Customer clicks **"إتمام الطلب"** → navigates to `/checkout`

---

## Checkout Flow

1. Customer fills form: name, phone, city (dropdown), address
2. City selection updates delivery fee preview in real time
3. On submit → `POST /api/orders` with cart items (IDs + quantities only)
4. Server validates, recalculates prices, saves order
5. On success → cart is cleared, customer redirected to `/thank-you?order=VL...`

---

## Thank-You Page

Route: `/thank-you?order=VL260612-A3B2`

- Fetches order from `GET /api/orders/[id]/public`
- Shows order summary, items, total, estimated delivery
- Provides WhatsApp confirmation link
- No admin auth required (public route with order ID)

---

## How Frontend Connects to Backend

All API calls use **relative URLs** (e.g., `/api/orders`).
There is no separate API server — both live in the same Next.js process.

In production, the Next.js server handles both page rendering and API routes.

---

## Required Frontend Environment Variables

| Variable | Where used |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsAppFAB, CartDrawer, product pages — WA links |
| `NEXT_PUBLIC_SITE_URL` | SEO metadata (og:url, canonical) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Facebook Pixel (optional) |

Variables prefixed `NEXT_PUBLIC_` are embedded into the client bundle at build time.

---

## RTL Configuration

- `<html dir="rtl" lang="ar">` set in `app/layout.tsx`
- Tailwind uses `start`/`end` logical properties throughout (not `left`/`right`)
- Font: **Cairo** (Google Fonts) loaded via `<link>` in layout head
- All user-visible text is in Moroccan Darija / Arabic

---

## Design System (Tailwind tokens)

Defined in `frontend/tailwind.config.js`:

| Token | Color | Use |
|---|---|---|
| `veluna-plum` | `#7A3E68` | Primary — buttons, prices, accents |
| `veluna-rose` | `#D4728A` | Secondary accent |
| `veluna-blush` | `#FFF0F5` | Light backgrounds, cards |
| `veluna-cream` | `#FDF6F0` | Page background |
| `veluna-dark` | `#2D1B2E` | Headings |
| `veluna-text` | `#4A3040` | Body text |
| `veluna-muted` | `#9B7A8C` | Subdued text |

---

## Editing Content

| What | Where |
|---|---|
| Product names, benefits, FAQ | `frontend/lib/products.ts` |
| Product prices | `frontend/lib/backend-products.ts` AND `frontend/lib/products.ts` |
| Delivery fees | `frontend/lib/delivery.ts` |
| Homepage sections | `frontend/components/sections/` |
| Brand colors | `frontend/tailwind.config.js` |
| Global styles | `frontend/app/globals.css` |
| Site metadata / SEO | `frontend/app/layout.tsx` |
