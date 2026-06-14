import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-veluna-dark text-white/80 mt-16">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-5">
              <Link href="/" className="inline-block group">
                <div className="bg-veluna-cream rounded-2xl px-4 py-2.5 inline-flex items-center shadow-veluna-sm group-hover:shadow-veluna-md transition-shadow">
                  <Image
                    src="/logo.png"
                    alt="فيلونا"
                    width={100}
                    height={31}
                    className="h-7 w-auto"
                    sizes="100px"
                  />
                </div>
              </Link>
              <span className="block text-xs text-white/50 mt-3">فيلونا – عناية بشرة المرأة</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              روتين العناية بالجسم من خطوتين. مصنوع خصيصاً لبشرة المرأة المغربية بعد إزالة الشعر.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-5">
              <a
                href="https://instagram.com/veluna.ma"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me/212600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#25D366]/40 flex items-center justify-center transition-colors"
                aria-label="واتساب"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">المنتجات</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products/zit-manaa" className="hover:text-white transition-colors">زيت إزالة الشعر</Link></li>
              <li><Link href="/products/krim-jlid" className="hover:text-white transition-colors">كريم الشعر تحت الجلد</Link></li>
              <li><Link href="/packs" className="hover:text-white transition-colors">الباقات والعروض</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">خدمة الزبونة</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">تواصلي معنا</Link></li>
              <li>
                <a href="https://wa.me/212600000000" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  واتساب
                </a>
              </li>
              <li><span className="text-white/40">الدفع عند الاستلام</span></li>
              <li><span className="text-white/40">توصيل داخل المغرب</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">تواصلي معنا</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="mailto:contact@veluna.ma" className="hover:text-white transition-colors">
                  contact@veluna.ma
                </a>
              </li>
              <li>
                <a href="https://wa.me/212600000000" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  +212 6 00 00 00 00
                </a>
              </li>
              <li className="text-white/40">المغرب</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-white/40">
          <p>© {new Date().getFullYear()} فيلونا. جميع الحقوق محفوظة.</p>
          <p className="text-center max-w-2xl">
            النتائج كتختلف من بشرة لبشرة. منتجات فيلونا مخصصة للعناية التجميلية بالبشرة وماشي علاج طبي. ديري اختبار بسيط قبل الاستعمال، وما تستعمليش المنتجات على البشرة المجروحة أو المتهيجة.
          </p>
        </div>
      </div>
    </footer>
  )
}
