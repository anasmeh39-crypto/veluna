import ProductCard from '../ProductCard'
import { products } from '@/lib/products'

export default function ProductsGrid() {
  return (
    <section className="bg-veluna-blush py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="tag">منتجاتنا</span>
          <h2 className="section-heading mt-4">
            اختاري ما{' '}
            <span className="text-veluna-plum">يناسبك</span>
          </h2>
          <p className="section-sub">
            منتجان مصنوعان خصيصاً لبشرة المرأة — كل واحد يحل مشكلة حقيقية.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} featured={i === 0} />
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-veluna-mauve mt-8 max-w-lg mx-auto">
          * النتائج كتختلف من بشرة لبشرة. المنتجات مخصصة للعناية التجميلية وليست علاجاً طبياً.
        </p>
      </div>
    </section>
  )
}
