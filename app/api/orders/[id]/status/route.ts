import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus, ORDER_STATUSES, type OrderStatus } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    let body: { status?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
    }

    const newStatus = body.status as OrderStatus
    if (!newStatus || !ORDER_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `حالة غير صالحة. القيم المقبولة: ${ORDER_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const order = updateOrderStatus(params.id, newStatus)
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error('[PATCH /api/orders/[id]/status]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value
  const expected = process.env.ADMIN_SECRET_TOKEN
  if (!expected) return false
  return token === expected
}
