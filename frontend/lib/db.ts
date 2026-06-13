import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

let schemaInitialized = false

async function initSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id             VARCHAR(20)   PRIMARY KEY,
      customer_name  TEXT          NOT NULL,
      phone          VARCHAR(20)   NOT NULL,
      city           VARCHAR(100)  NOT NULL,
      address        TEXT          NOT NULL,
      items          TEXT          NOT NULL,
      subtotal       DECIMAL(10,2) NOT NULL,
      delivery_fee   DECIMAL(10,2) NOT NULL,
      total          DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(20)   NOT NULL DEFAULT 'cod',
      status         VARCHAR(20)   NOT NULL DEFAULT 'new',
      notes          TEXT,
      source         VARCHAR(100),
      utm_source     VARCHAR(100),
      utm_medium     VARCHAR(100),
      utm_campaign   VARCHAR(100),
      utm_content    VARCHAR(100),
      fbclid         VARCHAR(200),
      user_agent     TEXT,
      ip_address     VARCHAR(45),
      created_at     VARCHAR(30)   NOT NULL,
      updated_at     VARCHAR(30)   NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_phone      ON orders(phone);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
  `)
  schemaInitialized = true
}

async function ensureSchema(): Promise<void> {
  if (!schemaInitialized) await initSchema()
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
    ...(row as Omit<Order, 'items' | 'subtotal' | 'delivery_fee' | 'total'>),
    subtotal:     Number(row.subtotal),
    delivery_fee: Number(row.delivery_fee),
    total:        Number(row.total),
    items:        JSON.parse(row.items as string) as OrderItem[],
  }
}

export async function createOrder(
  data: Omit<Order, 'id' | 'created_at' | 'updated_at'>
): Promise<Order> {
  await ensureSchema()
  const now = new Date().toISOString()

  for (let attempt = 0; attempt < 3; attempt++) {
    const id = generateOrderId()
    try {
      const result = await pool.query(
        `INSERT INTO orders (
          id, customer_name, phone, city, address, items,
          subtotal, delivery_fee, total, payment_method, status, notes,
          source, utm_source, utm_medium, utm_campaign, utm_content,
          fbclid, user_agent, ip_address, created_at, updated_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
        ) RETURNING *`,
        [
          id,
          data.customer_name,
          data.phone,
          data.city,
          data.address,
          JSON.stringify(data.items),
          data.subtotal,
          data.delivery_fee,
          data.total,
          data.payment_method,
          data.status,
          data.notes ?? null,
          data.source ?? null,
          data.utm_source ?? null,
          data.utm_medium ?? null,
          data.utm_campaign ?? null,
          data.utm_content ?? null,
          data.fbclid ?? null,
          data.user_agent ?? null,
          data.ip_address ?? null,
          now,
          now,
        ]
      )
      return rowToOrder(result.rows[0])
    } catch (err: unknown) {
      const isUnique =
        err instanceof Error && err.message.includes('unique') ||
        (err as { code?: string })?.code === '23505'
      if (!isUnique || attempt === 2) throw err
    }
  }
  throw new Error('Failed to generate unique order ID after 3 attempts')
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  await ensureSchema()
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id])
  return result.rows[0] ? rowToOrder(result.rows[0]) : undefined
}

export async function listOrders(opts: {
  status?: OrderStatus
  search?: string
  limit?: number
  offset?: number
}): Promise<{ orders: Order[]; total: number }> {
  await ensureSchema()
  const { status, search, limit = 50, offset = 0 } = opts

  const conditions: string[] = []
  const params: (string | number)[] = []
  let idx = 1

  if (status) {
    conditions.push(`status = $${idx++}`)
    params.push(status)
  }

  if (search) {
    const like = `%${search}%`
    conditions.push(`(customer_name ILIKE $${idx} OR phone ILIKE $${idx + 1} OR id ILIKE $${idx + 2})`)
    params.push(like, like, like)
    idx += 3
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS c FROM orders ${where}`,
    params
  )
  const total: number = countResult.rows[0].c

  const rowsResult = await pool.query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  )

  return { orders: rowsResult.rows.map(rowToOrder), total }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | undefined> {
  await ensureSchema()
  const updated_at = new Date().toISOString()
  const result = await pool.query(
    'UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
    [status, updated_at, id]
  )
  return result.rows[0] ? rowToOrder(result.rows[0]) : undefined
}

function generateOrderId(): string {
  const date = new Date()
  const yy   = String(date.getFullYear()).slice(-2)
  const mm   = String(date.getMonth() + 1).padStart(2, '0')
  const dd   = String(date.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `VL${yy}${mm}${dd}-${rand}`
}