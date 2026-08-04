import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const order = await getOrderById(params.id)
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error('[GET /api/orders/[id]]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
