import { NextRequest, NextResponse } from 'next/server'
import { createOrder, listOrders, ORDER_STATUSES, type OrderStatus } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { calculateOrderPrices } from '@/lib/backend-products'
import { getDeliveryFee } from '@/lib/delivery'
import { attributionFromRequest, dispatchOrderPurchase } from '@/lib/tracking/server'

export const dynamic = 'force-dynamic'

// POST /api/orders — submit a new order
export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
    }

    const name = String(body.customer_name ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    const city = String(body.city ?? '').trim()
    const address = String(body.address ?? '').trim()
    const items = body.items as { id: string; quantity: number }[] | undefined
    const notes = body.notes ? String(body.notes).trim().slice(0, 500) : undefined

    const errors: string[] = []
    if (!name) errors.push('دخلي الاسم الكامل')
    if (!phone) errors.push('دخلي رقم الهاتف')
    else if (!isValidMoroccanPhone(phone)) errors.push('دخلي رقم الهاتف صحيح')
    if (!city) errors.push('اختاري المدينة')
    if (!address) errors.push('دخلي العنوان')
    if (!items || !Array.isArray(items) || items.length === 0) errors.push('السلة فارغة')

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 422 })
    }

    const priceResult = calculateOrderPrices(items!)
    if (!priceResult.valid) {
      return NextResponse.json({ errors: [priceResult.error] }, { status: 422 })
    }

    const { subtotal, lines } = priceResult
    const delivery_fee = getDeliveryFee(city, subtotal)
    const total = subtotal + delivery_fee

    // Click IDs, UTMs and first-party cookies. Opaque strings only — nothing
    // here influences pricing, totals or order state.
    const attribution = attributionFromRequest(req, body)

    const order = await createOrder({
      customer_name: name,
      phone: normalizePhone(phone),
      city,
      address,
      items: lines,
      subtotal,
      delivery_fee,
      total,
      payment_method: 'cod',
      status: 'new',
      notes,
      source: body.source ? String(body.source).slice(0, 100) : undefined,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
      utm_term: attribution.utm_term,
      fbclid: attribution.fbclid,
      ttclid: attribution.ttclid,
      sccid: attribution.sccid,
      fbp: attribution.fbp,
      fbc: attribution.fbc,
      ttp: attribution.ttp,
      scid: attribution.scid,
      landing_page: attribution.landing_page,
      referrer: attribution.referrer,
      user_agent: attribution.user_agent,
      ip_address: attribution.ip,
    })

    // Server-side conversion. Deliberately not awaited: an ad platform being
    // slow or down must never delay or fail a customer's order. Delivery status
    // is recorded in tracking_events and surfaced in /admin/advertising.
    const eventSourceUrl = body.event_source_url ? String(body.event_source_url).slice(0, 500) : undefined
    void dispatchOrderPurchase(
      order,
      {
        ...attribution,
        identity: {
          phone: order.phone,
          name: order.customer_name,
          city: order.city,
          external_id: order.phone,
        },
      },
      eventSourceUrl
    ).catch((err) => {
      console.error('[POST /api/orders] purchase dispatch error:', err instanceof Error ? err.message : err)
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/orders] Unhandled error:', err)
    return NextResponse.json(
      { error: 'وقع خطأ في الخادم، عاودي المحاولة أو تواصلي معنا فالواتساب' },
      { status: 500 }
    )
  }
}

// GET /api/orders — admin: list orders
export async function GET(req: NextRequest) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') as OrderStatus | null
    const search = searchParams.get('search') ?? undefined
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200)
    const offset = Number(searchParams.get('offset') ?? 0)

    if (status && !ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 })
    }

    const result = await listOrders({ status: status ?? undefined, search, limit, offset })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/orders] Unhandled error:', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

function isValidMoroccanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '')
  return /^(?:\+212|00212|0)[5-7]\d{8}$/.test(cleaned)
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().]/g, '')
}
