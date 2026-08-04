import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus, ORDER_STATUSES, type OrderStatus } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { dispatchOrderStatusChange } from '@/lib/tracking/server'

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

    const order = await updateOrderStatus(params.id, newStatus)
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Lifecycle event (and the Purchase itself when the configured conversion
    // milestone is this status). Fire-and-forget — the admin UI must stay fast.
    void dispatchOrderStatusChange(order, newStatus).catch((err) => {
      console.error('[PATCH status] lifecycle dispatch error:', err instanceof Error ? err.message : err)
    })

    return NextResponse.json({ order })
  } catch (err) {
    console.error('[PATCH /api/orders/[id]/status]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
