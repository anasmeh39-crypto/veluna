import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }))

  // Strip whitespace and accidental surrounding quotes (common Easypanel paste issues)
  const adminPassword = (process.env.ADMIN_PASSWORD ?? '').trim().replace(/^["']|["']$/g, '')
  const adminToken    = (process.env.ADMIN_SECRET_TOKEN ?? '').trim()

  if (!adminPassword) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD غير معيّن — راجع Easypanel' }, { status: 500 })
  }
  if (!adminToken) {
    return NextResponse.json({ error: 'ADMIN_SECRET_TOKEN غير معيّن — راجع Easypanel' }, { status: 500 })
  }

  if (password.trim() !== adminPassword) {
    return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}
