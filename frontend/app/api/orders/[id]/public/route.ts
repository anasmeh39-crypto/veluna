import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Public endpoint — only returns fields safe to show on the thank-you page.
// Does NOT expose admin-only data (IP, UA, UTM, etc).
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await getOrderById(params.id)
  if (!order) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  return NextResponse.json({
    order: {
      id: order.id,
      customer_name: order.customer_name,
      city: order.city,
      items: order.items,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      total: order.total,
      payment_method: order.payment_method,
      status: order.status,
      created_at: order.created_at,
    },
  })
}
