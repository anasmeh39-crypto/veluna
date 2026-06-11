import { NextResponse } from 'next/server'
import { BACKEND_PRODUCTS } from '@/lib/backend-products'

export const dynamic = 'force-dynamic'

export function GET() {
  const active = BACKEND_PRODUCTS.filter((p) => p.active)
  return NextResponse.json({ products: active })
}
