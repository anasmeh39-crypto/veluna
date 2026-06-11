import Link from 'next/link'
import ProductImage from '../ProductImage'
import { products } from '@/lib/products'

export default function BundlePromo() {
  const oil   = products[0]
  const cream = products[1]
  const bundlePrice   = 249
  const originalPrice = 278
  const saving        = originalPrice - bundlePrice

  return (
    <section className="bg-veluna-dark py-16 md:py-24 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 end-0 w-72 h-72 rounded-full bg-veluna-lavender opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-56 h-56 rounded-full bg-veluna-pink opacity-10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Text */}
          <div className="text-white">
            <span className="inline-block bg-veluna-lavender text-veluna-dark text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              الباقة المميزة 🌸
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
              روتين Veluna
              <span className="text-veluna-lavender"> الكامل</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-2">
              روتين كامل لإزالة الشعر والعناية بالبشرة من بعده:
            </p>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              الزيت كيساعد يزيل الشعر بسهولة — والكريم كيساعد يحسن مظهر الشعر تحت الجلد والحبيبات وجلد الوزة.
            </p>

            {/* Steps */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-veluna-lavender text-veluna-dark font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">١</span>
                <div>
                  <span className="text-sm font-semibold text-white">{oil.name}</span>
                  <p className="text-xs text-white/50 mt-0.5">يوم إزالة الشعر</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-veluna-pink text-veluna-dark font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">٢</span>
                <div>
                  <span className="text-sm font-semibold text-white">{cream.shortName || cream.name}</span>
                  <p className="text-xs text-white/50 mt-0.5">من بعد 24 ساعة — روتين يومي</p>
                </div>
              </div>
            </div>

            {/* Trust quick row */}
            <div className="flex flex-wrap gap-3 mb-6 text-xs text-white/60">
              <span>✓ الدفع عند الاستلام</span>
              <span>✓ توصيل داخل المغرب</span>
              <span>✓ مناسبة للبشرة الحساسة</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-extrabold text-veluna-lavender">{bundlePrice} <span className="text-xl">درهم</span></span>
              <span className="text-white/40 line-through text-lg">{originalPrice} درهم</span>
            </div>
            <p className="text-[#25D366] text-sm font-semibold mb-6">وفري {saving} درهم 🎉</p>

            <div className="flex flex-wrap gap-3">
              <Link href="/packs" className="btn-primary">
                اشتري الباقة الكاملة
              </Link>
              <Link href="/packs" className="btn-outline border-white/40 text-white hover:bg-white/10 hover:border-white">
                شوفي كل الباقات
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="flex items-center justify-center gap-6">
            <div className="w-36 h-52">
              <ProductImage type="oil" colorFrom={oil.colorFrom} colorTo={oil.colorTo} />
            </div>
            <div className="text-2xl font-bold text-veluna-lavender">+</div>
            <div className="w-40 h-44">
              <ProductImage type="cream" colorFrom={cream.colorFrom} colorTo={cream.colorTo} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
