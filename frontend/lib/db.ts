import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'veluna.db')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initSchema(_db)
  }
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id            TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone         TEXT NOT NULL,
      city          TEXT NOT NULL,
      address       TEXT NOT NULL,
      items         TEXT NOT NULL,
      subtotal      REAL NOT NULL,
      delivery_fee  REAL NOT NULL,
      total         REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'cod',
      status        TEXT NOT NULL DEFAULT 'new',
      notes         TEXT,
      source        TEXT,
      utm_source    TEXT,
      utm_medium    TEXT,
      utm_campaign  TEXT,
      utm_content   TEXT,
      fbclid        TEXT,
      user_agent    TEXT,
      ip_address    TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_phone      ON orders(phone);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
  `)
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export const ORDER_STATUSES: OrderStatus[] = [
  'new',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
]

export interface OrderItem {
  id: string
  name_ar: string
  price_mad: number
  quantity: number
}

export interface Order {
  id: string
  customer_name: string
  phone: string
  city: string
  address: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: string
  status: OrderStatus
  notes?: string
  source?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  fbclid?: string
  user_agent?: string
  ip_address?: string
  created_at: string
  updated_at: string
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    ...(row as Omit<Order, 'items'>),
    items: JSON.parse(row.items as string) as OrderItem[],
  }
}

export function createOrder(data: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Order {
  const db = getDb()
  const now = new Date().toISOString()

  // Retry up to 3 times in the unlikely event of an ID collision
  let id = ''
  for (let attempt = 0; attempt < 3; attempt++) {
    id = generateOrderId()
    try {
      db.prepare(`
        INSERT INTO orders (
          id, customer_name, phone, city, address, items,
          subtotal, delivery_fee, total, payment_method, status, notes,
          source, utm_source, utm_medium, utm_campaign, utm_content,
          fbclid, user_agent, ip_address, created_at, updated_at
        ) VALUES (
          @id, @customer_name, @phone, @city, @address, @items,
          @subtotal, @delivery_fee, @total, @payment_method, @status, @notes,
          @source, @utm_source, @utm_medium, @utm_campaign, @utm_content,
          @fbclid, @user_agent, @ip_address, @created_at, @updated_at
        )
      `).run({
        ...data,
        id,
        items: JSON.stringify(data.items),
        notes: data.notes ?? null,
        source: data.source ?? null,
        utm_source: data.utm_source ?? null,
        utm_medium: data.utm_medium ?? null,
        utm_campaign: data.utm_campaign ?? null,
        utm_content: data.utm_content ?? null,
        fbclid: data.fbclid ?? null,
        user_agent: data.user_agent ?? null,
        ip_address: data.ip_address ?? null,
        created_at: now,
        updated_at: now,
      })
      break // success
    } catch (err: unknown) {
      const isUnique =
        err instanceof Error && err.message.includes('UNIQUE constraint failed')
      if (!isUnique || attempt === 2) throw err
      // try again with a new ID
    }
  }

  const saved = getOrderById(id)
  if (!saved) throw new Error(`Order ${id} was not saved correctly`)
  return saved
}

export function getOrderById(id: string): Order | undefined {
  const db = getDb()
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return row ? rowToOrder(row) : undefined
}

export function listOrders(opts: {
  status?: OrderStatus
  search?: string
  limit?: number
  offset?: number
}): { orders: Order[]; total: number } {
  const db = getDb()
  const { status, search, limit = 50, offset = 0 } = opts

  const conditions: string[] = []
  const params: (string | number)[] = []

  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }

  if (search) {
    const like = `%${search}%`
    conditions.push('(customer_name LIKE ? OR phone LIKE ? OR id LIKE ?)')
    params.push(like, like, like)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const total = (db.prepare(`SELECT COUNT(*) as c FROM orders ${where}`).get(...params) as { c: number }).c
  const rows = db.prepare(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset) as Record<string, unknown>[]

  return { orders: rows.map(rowToOrder), total }
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const db = getDb()
  const updated_at = new Date().toISOString()
  const result = db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(status, updated_at, id)
  if (result.changes === 0) return undefined
  return getOrderById(id)
}

function generateOrderId(): string {
  const date = new Date()
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `VL${yy}${mm}${dd}-${rand}`
}
