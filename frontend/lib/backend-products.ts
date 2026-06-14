// Backend product catalog — single source of truth for prices.
// Update prices here; they are recalculated server-side on every order submission.

export interface BackendProduct {
  id: string
  slug: string
  name_ar: string
  price_mad: number
  compare_at_price_mad?: number
  product_type: 'single' | 'pack'
  active: boolean
}

export const BACKEND_PRODUCTS: BackendProduct[] = [
  {
    id: 'zit-manaa',
    slug: 'zit-manaa',
    name_ar: 'زيت إزالة الشعر',
    price_mad: 149,
    compare_at_price_mad: 179,
    product_type: 'single',
    active: true,
  },
  {
    id: 'krim-jlid',
    slug: 'krim-jlid',
    name_ar: 'كريم الشعر تحت الجلد و جلد الوزة',
    price_mad: 129,
    compare_at_price_mad: 159,
    product_type: 'single',
    active: true,
  },
  {
    id: 'routine-complete',
    slug: 'routine-complete',
    name_ar: 'روتين فيلونا الكامل',
    price_mad: 249,
    compare_at_price_mad: 278,
    product_type: 'pack',
    active: true,
  },
  {
    id: 'pack-oil-x2',
    slug: 'pack-oil-x2',
    name_ar: 'باقة زيت إزالة الشعر × 2',
    price_mad: 279,
    compare_at_price_mad: 298,
    product_type: 'pack',
    active: true,
  },
  {
    id: 'pack-cream-x2',
    slug: 'pack-cream-x2',
    name_ar: 'باقة كريم الشعر تحت الجلد × 2',
    price_mad: 239,
    compare_at_price_mad: 258,
    product_type: 'pack',
    active: true,
  },
]

const productMap = new Map(BACKEND_PRODUCTS.map((p) => [p.id, p]))

export function getBackendProduct(id: string): BackendProduct | undefined {
  return productMap.get(id)
}

export interface CartLineInput {
  id: string
  quantity: number
}

export interface PriceCalculation {
  valid: boolean
  error?: string
  subtotal: number
  lines: { id: string; name_ar: string; price_mad: number; quantity: number }[]
}

export function calculateOrderPrices(items: CartLineInput[]): PriceCalculation {
  if (!items || items.length === 0) {
    return { valid: false, error: 'السلة فارغة', subtotal: 0, lines: [] }
  }

  let subtotal = 0
  const lines: PriceCalculation['lines'] = []

  for (const item of items) {
    const product = productMap.get(item.id)
    if (!product) {
      return { valid: false, error: `منتج غير موجود: ${item.id}`, subtotal: 0, lines: [] }
    }
    if (!product.active) {
      return { valid: false, error: `المنتج غير متوفر حالياً: ${product.name_ar}`, subtotal: 0, lines: [] }
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
      return { valid: false, error: 'الكمية يجب أن تكون بين 1 و 10', subtotal: 0, lines: [] }
    }
    subtotal += product.price_mad * item.quantity
    lines.push({
      id: product.id,
      name_ar: product.name_ar,
      price_mad: product.price_mad,
      quantity: item.quantity,
    })
  }

  return { valid: true, subtotal, lines }
}
