'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/',        label: 'الرئيسية' },
  { href: null,       label: 'المنتجات', children: [
    { href: '/products/zit-manaa',  label: 'زيت إزالة الشعر' },
    { href: '/products/krim-jlid',  label: 'كريم الشعر تحت الجلد' },
  ]},
  { href: '/packs',   label: 'الباقات' },
  { href: '/contact', label: 'تواصلي معنا' },
]

export default function Header() {
  const { itemCount, openCart } = useCart()
  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setProductOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-veluna-cream/95 backdrop-blur-md shadow-sm border-b border-veluna-petal'
            : 'bg-veluna-cream/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center group" aria-label="فيلونا – الصفحة الرئيسية">
              <Image
                src="/logo.png"
                alt="فيلونا"
                width={120}
                height={37}
                className="h-8 w-auto transition-opacity group-hover:opacity-70"
                priority
                sizes="120px"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative group">
                    <button className="px-4 py-2 text-sm font-semibold text-veluna-text hover:text-veluna-plum transition-colors flex items-center gap-1">
                      {link.label}
                      <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute top-full end-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-veluna-petal py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-veluna-text hover:text-veluna-plum hover:bg-veluna-blush transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href!}
                    className={`px-4 py-2 text-sm font-semibold transition-colors rounded-lg ${
                      pathname === link.href
                        ? 'text-veluna-plum bg-veluna-blush'
                        : 'text-veluna-text hover:text-veluna-plum hover:bg-veluna-blush'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Cart button */}
              <button
                onClick={openCart}
                className="relative p-2.5 rounded-xl hover:bg-veluna-blush transition-colors"
                aria-label="السلة"
              >
                <svg className="w-5 h-5 text-veluna-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -end-1 w-5 h-5 bg-veluna-plum text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-veluna-blush transition-colors"
                aria-label="القائمة"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5 text-veluna-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-veluna-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-veluna-cream border-t border-veluna-petal animate-fade-in">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <button
                      onClick={() => setProductOpen(!productOpen)}
                      className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold text-veluna-text hover:text-veluna-plum hover:bg-veluna-blush rounded-xl transition-colors"
                    >
                      {link.label}
                      <svg className={`w-4 h-4 transition-transform ${productOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {productOpen && (
                      <div className="me-4 mt-1 flex flex-col gap-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="px-6 py-2.5 text-sm text-veluna-muted hover:text-veluna-plum hover:bg-veluna-blush rounded-xl transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href!}
                    className={`px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                      pathname === link.href
                        ? 'text-veluna-plum bg-veluna-blush'
                        : 'text-veluna-text hover:text-veluna-plum hover:bg-veluna-blush'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}
