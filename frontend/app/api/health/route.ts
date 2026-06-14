import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { pingDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/health — quick diagnostics for orders/DB/fallback.
export async function GET() {
  const db = await pingDb()

  const fallbackPath = process.env.ORDER_FALLBACK_PATH || path.join('/tmp', 'veluna-orders.json')
  let fallbackWritable = false
  let fallbackError: string | undefined
  try {
    const probe = path.join(path.dirname(fallbackPath), '.veluna-write-probe')
    await fs.writeFile(probe, 'ok', 'utf8')
    await fs.unlink(probe).catch(() => {})
    fallbackWritable = true
  } catch (err) {
    fallbackError = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json({
    ok: db.ok || fallbackWritable, // orders can be taken if either works
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    db: db.ok ? 'ok' : 'down',
    dbError: db.error,
    fallbackPath,
    fallbackWritable,
    fallbackError,
    time: new Date().toISOString(),
  })
}
