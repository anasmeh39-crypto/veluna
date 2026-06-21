import { google } from 'googleapis'

export interface SheetOrder {
  id: string
  customerName: string
  phone: string
  city: string
  address: string
  items: string
  quantity: number
  total: number
  status: string
  notes?: string
  createdAt: string
}

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key   = process.env.GOOGLE_PRIVATE_KEY
  const sheet = process.env.GOOGLE_SHEET_ID

  if (!email || !key || !sheet) {
    throw new Error('Missing Google Sheets env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key:  key.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return { auth, sheetId: sheet }
}

export async function addOrderToSheet(order: SheetOrder): Promise<void> {
  const { auth, sheetId } = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const row = [
    order.createdAt,
    order.id,
    order.customerName,
    order.phone,
    order.city,
    order.address,
    order.items,
    order.quantity,
    order.total,
    order.status,
    order.notes ?? '',
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId:     sheetId,
    range:             'Sheet1!A:K',
    valueInputOption:  'USER_ENTERED',
    requestBody:       { values: [row] },
  })
}
