'use client'

import { usePathname } from 'next/navigation'
import { CartProvider } from '@/context/CartContext'
import { TrackingProvider } from '@/context/TrackingContext'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import WhatsAppFAB from './WhatsAppFAB'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // The admin area loads no pixels and no cart.
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <TrackingProvider>
      <CartProvider>
        <Header />
        <CartDrawer />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFAB />
      </CartProvider>
    </TrackingProvider>
  )
}
