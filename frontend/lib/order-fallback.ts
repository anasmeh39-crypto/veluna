import { promises as fs } from 'fs'
import path from 'path'
import type { Order, OrderStatus } from './db'

/**
 * Emergency fallback order store.
 *
 * Used ONLY when Postgres is unreachable (e.g. DATABASE_URL not configured)
 * so a customer's order is never lost on a hard DB error. Postgres stays the
 * primary store; this file is a safety net.
 *
 * For durability across redeploys, point ORDER_FALLBACK_PATH at a mounted
 * volume. Otherwise it lives in /tmp for the container's lifetime.
 */
const TMP_FILE = path.join('/tmp', 'veluna-orders.json')
const FILE = process.env.ORDER_FALLBACK_PATH || TMP_FILE

async function readAll(): Promise<Order[]> {
  try {
    const txt = await fs.readFile(FILE, 'utf8')
    const parsed = JSON.parse(txt)
    return Array.isArray(parsed) ? (parsed as Order[]) : []
  } catch {
    return []
  }
}

async function writeAll(orders: Order[]): Promise<boolean> {
  // Try the configured path first, then /tmp as a last resort.
  const targets = FILE === TMP_FILE ? [FILE] : [FILE, TMP_FILE]
  for (const target of targets) {
    try {
      await fs.writeFile(target, JSON.stringify(orders), 'utf8')
      return true
    } catch (err) {
      console.error(`[order-fallback] Failed to write fallback file at ${target}:`, err)
    }
  }
  return false
}

export async function appendFallbackOrder(order: Order): Promise<void> {
  // Must never throw — an order is never allowed to fail at this point.
  try {
    const all = await readAll()
    all.push(order)
    const ok = await writeAll(all)
    if (ok) {
      console.warn(`[order-fallback] Order ${order.id} saved to fallback store (Postgres unavailable).`)
      return
    }
  } catch (err) {
    console.error('[order-fallback] appendFallbackOrder error:', err)
  }
  // Could not persist anywhere — log the full order so it is recoverable from logs.
  console.error('[order-fallback] ORDER NOT PERSISTED — recover from this log line:\n' + JSON.stringify(order))
}

export async function getFallbackOrderById(id: string): Promise<Order | undefined> {
  return (await readAll()).find((o) => o.id === id)
}

export async function listFallbackOrders(): Promise<Order[]> {
  return readAll()
}

export async function updateFallbackOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | undefined> {
  const all = await readAll()
  const idx = all.findIndex((o) => o.id === id)
  if (idx === -1) return undefined
  all[idx] = { ...all[idx], status, updated_at: new Date().toISOString() }
  await writeAll(all)
  return all[idx]
}
