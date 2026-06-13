'use client'

import { useEffect, useState, useCallback } from 'react'

interface OrderItem {
  id: string
  name_ar: string
  price_mad: number
  quantity: number
}

interface Order {
  id: string
  customer_name: string
  phone: string
  city: string
  address: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  status: string
  notes?: string
  created_at: string
  utm_source?: string
  utm_campaign?: string
}

type Status = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

const STATUS_LABELS: Record<Status, string> = {
  new: 'جديد',
  confirmed: 'مأكد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  returned: 'مرجع',
}

const STATUS_COLORS: Record<Status, string> = {
  new: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '212600000000'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-MA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function exportCSV(orders: Order[]) {
  const headers = ['رقم الطلب', 'الاسم', 'الهاتف', 'المدينة', 'المنتجات', 'المجموع', 'الحالة', 'التاريخ']
  const rows = orders.map((o) => [
    o.id,
    o.customer_name,
    o.phone,
    o.city,
    o.items.map((i) => `${i.name_ar}×${i.quantity}`).join(' + '),
    `${o.total} DH`,
    STATUS_LABELS[o.status as Status] ?? o.status,
    formatDate(o.created_at),
  ])
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `veluna-orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | ''>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)
    try {
      const res = await fetch(`/api/orders?${params}`)
      if (res.status === 401) { window.location.href = '/admin/login'; return }
      const data = await res.json()
      setOrders(data.orders ?? [])
      setTotal(data.total ?? 0)
    } catch {
      // error fetching
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function updateStatus(id: string, status: Status) {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const { order } = await res.json()
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: order.status } : o)))
        if (selectedOrder?.id === id) setSelectedOrder((s) => s ? { ...s, status: order.status } : s)
      }
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
    .reduce((s, o) => s + o.total, 0)

  return (
    <div className="min-h-screen bg-gray-50 font-[Cairo,sans-serif]" dir="rtl">

      {/* Top bar */}
      <div className="bg-veluna-dark text-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-extrabold text-lg">Veluna Admin</h1>
          <span className="text-white/50 text-sm hidden sm:block">لوحة الطلبات</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCSV(orders)}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            تصدير CSV
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            خروج
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الطلبات', value: total },
            { label: 'طلبات جديدة', value: orders.filter((o) => o.status === 'new').length, accent: true },
            { label: 'تم التوصيل', value: orders.filter((o) => o.status === 'delivered').length },
            { label: 'رقم المعاملات', value: `${totalRevenue} د` },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl p-4 border ${s.accent ? 'border-veluna-plum/30' : 'border-gray-200'}`}>
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.accent ? 'text-veluna-plum' : 'text-gray-800'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
          <input
            type="search"
            placeholder="ابحث بالاسم أو الهاتف أو رقم الطلب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-veluna-plum/30"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | '')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-veluna-plum/30"
          >
            <option value="">كل الحالات</option>
            {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button
            onClick={fetchOrders}
            className="bg-veluna-plum text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            بحث
          </button>
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <svg className="animate-spin w-8 h-8 mx-auto mb-3 text-veluna-plum" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              جاري التحميل...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">لا توجد طلبات</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['رقم الطلب', 'الزبون', 'المنتجات', 'المجموع', 'الحالة', 'التاريخ', 'إجراءات'].map((h) => (
                      <th key={h} className="px-4 py-3 text-right font-semibold text-gray-600 text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-veluna-plum font-bold">{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{order.customer_name}</p>
                        <p className="text-gray-400 text-xs">{order.city}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-gray-700 text-xs line-clamp-2">
                          {order.items.map((i) => `${i.name_ar} ×${i.quantity}`).join(' + ')}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{order.total} د</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status as Status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABELS[order.status as Status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {/* Copy phone */}
                          <button
                            title="انسخ الهاتف"
                            onClick={() => navigator.clipboard.writeText(order.phone)}
                            className="p-1.5 text-gray-400 hover:text-veluna-plum transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/${order.phone.replace(/^0/, '212')}?text=${encodeURIComponent(`سلام ${order.customer_name}، معاك فريق Veluna. طلبيتك رقم ${order.id} (${order.total} درهم) غادي نأكدوها معاك.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="واتساب"
                            className="p-1.5 text-gray-400 hover:text-[#25D366] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                              <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
                            </svg>
                          </a>
                          {/* Status changer */}
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => updateStatus(order.id, e.target.value as Status)}
                            className="border border-gray-200 rounded-lg text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-veluna-plum bg-white"
                          >
                            {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order detail drawer */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed inset-y-0 end-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-bold text-lg text-gray-800">تفاصيل الطلب</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Order ID + status */}
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-veluna-plum">{selectedOrder.id}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[selectedOrder.status as Status]}`}>
                  {STATUS_LABELS[selectedOrder.status as Status]}
                </span>
              </div>

              {/* Customer */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">معلومات الزبون</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">الاسم</span>
                  <span className="font-semibold">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">الهاتف</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold font-mono" dir="ltr">{selectedOrder.phone}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedOrder.phone)}
                      className="text-gray-400 hover:text-veluna-plum"
                      title="نسخ"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المدينة</span>
                  <span className="font-semibold">{selectedOrder.city}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">العنوان</span>
                  <p className="font-semibold mt-1">{selectedOrder.address}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="text-sm">
                    <span className="text-gray-500">ملاحظات</span>
                    <p className="font-semibold mt-1 text-amber-700">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">المنتجات</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <span>{item.name_ar} × {item.quantity}</span>
                      <span className="font-semibold">{item.price_mad * item.quantity} درهم</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">المجموع الجزئي</span>
                  <span>{selectedOrder.subtotal} درهم</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">التوصيل</span>
                  <span>{selectedOrder.delivery_fee === 0 ? 'مجاني' : `${selectedOrder.delivery_fee} درهم`}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>المجموع</span>
                  <span className="text-veluna-plum">{selectedOrder.total} درهم</span>
                </div>
              </div>

              {/* Update status */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">تغيير الحالة</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                    <button
                      key={s}
                      disabled={selectedOrder.status === s || updatingId === selectedOrder.id}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className={`text-xs py-2 px-2 rounded-lg border font-semibold transition-colors ${
                        selectedOrder.status === s
                          ? 'bg-veluna-plum text-white border-veluna-plum'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-veluna-plum hover:text-veluna-plum'
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp + tracking */}
              <div className="space-y-2">
                <a
                  href={`https://wa.me/${selectedOrder.phone.replace(/^0/, '212')}?text=${encodeURIComponent(`سلام ${selectedOrder.customer_name}، معاك فريق Veluna\n\nطلبيتك رقم ${selectedOrder.id}\nالمجموع: ${selectedOrder.total} درهم\n\nغادي نأكدوها معاك قريباً. شكراً!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#1eb855] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
                  </svg>
                  تواصل عبر واتساب
                </a>
              </div>

              {/* Meta */}
              <div className="text-xs text-gray-400 border-t pt-3 space-y-1">
                <p>تاريخ الطلب: {formatDate(selectedOrder.created_at)}</p>
                {selectedOrder.utm_source && <p>مصدر: {selectedOrder.utm_source} / {selectedOrder.utm_campaign}</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
