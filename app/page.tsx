import Hero         from '@/components/sections/Hero'
import Problems     from '@/components/sections/Problems'
import Routine      from '@/components/sections/Routine'
import ProductsGrid from '@/components/sections/ProductsGrid'
import BundlePromo  from '@/components/sections/BundlePromo'
import TrustBadges  from '@/components/sections/TrustBadges'
import Testimonials from '@/components/sections/Testimonials'
import FAQ          from '@/components/sections/FAQ'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problems />
      <Routine />
      <ProductsGrid />
      <BundlePromo />
      <TrustBadges />
      <Testimonials />
      <FAQ />
    </>
  )
}
