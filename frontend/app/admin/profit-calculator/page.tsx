'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'

// ── Fixed costs ──────────────────────────────────────────────
const PLATFORM_FEE   = 65   // DH per delivered order
const OIL_COST       = 42   // DH per unit
const CREAM_COST     = 39   // DH per unit
const LS_KEY         = 'veluna_profit_calc'

interface Inputs {
  deliveredRevenue: string
  adSpend:          string
  deliveredOrders:  string
  oilQty:           string
  creamQty:         string
}

const DEFAULT_INPUTS: Inputs = {
  deliveredRevenue: '',
  adSpend:          '',
  deliveredOrders:  '',
  oilQty:           '',
  creamQty:         '',
}

function n(val: string) { return parseFloat(val) || 0 }

function fmt(val: number, decimals = 0) {
  return val.toLocaleString('fr-MA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function pct(val: number) { return val.toFixed(1) + '%' }

export default function ProfitCalculatorPage() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) setInputs(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(inputs)) } catch { /* ignore */ }
  }, [inputs])

  function handleChange(field: keyof Inputs, value: string) {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  function handleReset() {
    setInputs(DEFAULT_INPUTS)
    try { localStorage.removeItem(LS_KEY) } catch { /* ignore */ }
  }

  // ── Core values ──────────────────────────────────────────────
  const revenue      = n(inputs.deliveredRevenue)
  const adSpend      = n(inputs.adSpend)
  const orders       = n(inputs.deliveredOrders)
  const oilQty       = n(inputs.oilQty)
  const creamQty     = n(inputs.creamQty)

  const totalOilCost   = oilQty   * OIL_COST
  const totalCreamCost = creamQty * CREAM_COST
  const totalProductCost = totalOilCost + totalCreamCost
  const platformFees   = orders  * PLATFORM_FEE
  const totalExpenses  = totalProductCost + platformFees + adSpend
  const netProfit      = revenue - totalExpenses

  const hasRevenue = revenue > 0
  const hasOrders  = orders  > 0
  const hasAdSpend = adSpend > 0

  const profitMargin  = hasRevenue ? (netProfit / revenue) * 100              : null
  const roas          = hasAdSpend ? revenue / adSpend                        : null
  const cpo           = hasOrders  ? adSpend / orders                         : null
  const aov           = hasOrders  ? revenue / orders                         : null
  const profitPerOrder = hasOrders ? netProfit / orders                       : null
  const avgProductCost = hasOrders ? totalProductCost / orders                : null
  const breakEvenCpo   = aov !== null && avgProductCost !== null
    ? aov - avgProductCost - PLATFORM_FEE
    : null

  const profitIsPositive = netProfit >= 0

  // ── UI helpers ───────────────────────────────────────────────
  function InputField({
    label, field, placeholder, note,
  }: {
    label: string; field: keyof Inputs; placeholder: string; note?: string
  }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={inputs[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold
                       text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2
                       focus:ring-veluna-plum/30 focus:border-veluna-plum/40 transition-colors"
          />
          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
            DH
          </span>
        </div>
        {note && <p className="text-[10px] text-gray-400 mt-1">{note}</p>}
      </div>
    )
  }

  function MetricCard({
    label, value, sub, highlight,
  }: {
    label: string; value: string | null; sub?: string; highlight?: 'positive' | 'negative' | 'neutral'
  }) {
    const color =
      highlight === 'positive' ? 'text-green-600'
      : highlight === 'negative' ? 'text-red-500'
      : 'text-veluna-plum'

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 font-medium mb-1.5">{label}</p>
        <p className={`text-xl font-extrabold ${color}`}>
          {value ?? '—'}
        </p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    )
  }

  function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
      <div className={`flex justify-between text-sm py-2 border-b border-gray-100 last:border-0 ${bold ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
        <span>{label}</span>
        <span className={bold ? 'text-veluna-plum' : ''}>{value}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Cairo,sans-serif]" dir="rtl">

      <AdminHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Page title */}
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">حاسبة الأرباح</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            احسب أرباح فيلونا بناءً على الطلبيات الموصلة فعلاً — الدفع عند الاستلام
          </p>
        </div>

        {/* ── Inputs ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">

          {/* Section 1: Main inputs */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
              الإيرادات والإنفاق
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                label="الإيرادات الموصلة (DH)"
                field="deliveredRevenue"
                placeholder="0"
                note="المبلغ المحصل فعلاً من الطلبيات الموصلة"
              />
              <InputField
                label="الإنفاق الإعلاني (DH)"
                field="adSpend"
                placeholder="0"
              />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  عدد الطلبيات الموصلة
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inputs.deliveredOrders}
                    onChange={(e) => handleChange('deliveredOrders', e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold
                               text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2
                               focus:ring-veluna-plum/30 focus:border-veluna-plum/40 transition-colors"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    طلب
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">يُستخدم لحساب رسوم المنصة ومقاييس الطلب</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Section 2: Product quantities */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              كميات المنتجات الموصلة
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              وحدات فيزيائية — مثال: روتين كامل = زيت +1 وكريم +1
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  زيت إزالة الشعر — عدد الوحدات
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inputs.oilQty}
                    onChange={(e) => handleChange('oilQty', e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold
                               text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2
                               focus:ring-veluna-plum/30 focus:border-veluna-plum/40 transition-colors"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                    × {OIL_COST} DH
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  كريم الشعر تحت الجلد — عدد الوحدات
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inputs.creamQty}
                    onChange={(e) => handleChange('creamQty', e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold
                               text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2
                               focus:ring-veluna-plum/30 focus:border-veluna-plum/40 transition-colors"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                    × {CREAM_COST} DH
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reset */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-veluna-plum border border-gray-200 hover:border-veluna-plum/40
                         px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              إعادة تعيين
            </button>
          </div>
        </div>

        {/* ── Main metric cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <MetricCard
            label="صافي الربح"
            value={hasRevenue ? `${fmt(netProfit)} DH` : null}
            highlight={profitIsPositive ? 'positive' : 'negative'}
          />
          <MetricCard
            label="هامش الربح"
            value={profitMargin !== null ? pct(profitMargin) : null}
            highlight={profitMargin !== null ? (profitMargin >= 0 ? 'positive' : 'negative') : undefined}
          />
          <MetricCard
            label="ROAS"
            value={roas !== null ? roas.toFixed(2) + 'x' : null}
            sub={roas !== null ? `${fmt(revenue)} ÷ ${fmt(adSpend)}` : undefined}
          />
          <MetricCard
            label="ربح / طلبية"
            value={profitPerOrder !== null ? `${fmt(profitPerOrder)} DH` : null}
            highlight={profitPerOrder !== null ? (profitPerOrder >= 0 ? 'positive' : 'negative') : undefined}
          />
          <MetricCard
            label="تكلفة / طلبية (إعلان)"
            value={cpo !== null ? `${fmt(cpo)} DH` : null}
          />
          <MetricCard
            label="متوسط قيمة الطلب"
            value={aov !== null ? `${fmt(aov)} DH` : null}
          />
        </div>

        {/* ── Two-col breakdown ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Cost breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              تفصيل التكاليف
            </h3>
            <Row label="تكلفة المنتجات"   value={`${fmt(totalProductCost)} DH`} />
            <Row label="رسوم المنصة"      value={`${fmt(platformFees)} DH`} />
            <Row label="الإنفاق الإعلاني" value={`${fmt(adSpend)} DH`} />
            <Row label="إجمالي التكاليف"  value={`${fmt(totalExpenses)} DH`} bold />
            {hasRevenue && (
              <div className={`mt-3 text-xs text-center font-bold py-2 rounded-lg ${
                profitIsPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                {profitIsPositive ? '✓ رابحون' : '✗ خسارة'} — {fmt(netProfit)} DH
              </div>
            )}
          </div>

          {/* Product breakdown + break-even */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                تفصيل المنتجات
              </h3>
              <Row
                label={`زيت × ${fmt(oilQty)} وحدة`}
                value={`${fmt(oilQty)} × ${OIL_COST} = ${fmt(totalOilCost)} DH`}
              />
              <Row
                label={`كريم × ${fmt(creamQty)} وحدة`}
                value={`${fmt(creamQty)} × ${CREAM_COST} = ${fmt(totalCreamCost)} DH`}
              />
              <Row label="تكلفة المنتجات الإجمالية" value={`${fmt(totalProductCost)} DH`} bold />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                نقطة التعادل
              </h3>
              <Row label="رسوم المنصة / طلبية"       value={`${PLATFORM_FEE} DH`} />
              <Row label="متوسط تكلفة المنتج / طلبية" value={avgProductCost !== null ? `${fmt(avgProductCost, 1)} DH` : '—'} />
              <Row label="متوسط قيمة الطلب"           value={aov !== null ? `${fmt(aov, 1)} DH` : '—'} />
              <Row
                label="إنفاق إعلاني / طلبية للتعادل"
                value={breakEvenCpo !== null ? `${fmt(breakEvenCpo, 1)} DH` : '—'}
                bold
              />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          * الحسابات بناءً على الطلبيات الموصلة فعلاً — لا تشمل الملغاة أو المرجعة
        </p>
      </div>
    </div>
  )
}
