'use client'

import { usePathname } from 'next/navigation'
import { CartProvider } from '@/context/CartContext'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import WhatsAppFAB from './WhatsAppFAB'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <CartProvider>
      <Header />
      <CartDrawer />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppFAB />
    </CartProvider>
  )
}
