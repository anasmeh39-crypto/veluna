import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/lib/db'

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

function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value
  const expected = process.env.ADMIN_SECRET_TOKEN
  if (!expected) return false
  return token === expected
}
