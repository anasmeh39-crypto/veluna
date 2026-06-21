'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminHeaderProps {
  rightSlot?: React.ReactNode
}

const TABS = [
  { href: '/admin/orders',            label: 'الطلبات' },
  { href: '/admin/profit-calculator', label: 'حاسبة الأرباح' },
]

export default function AdminHeader({ rightSlot }: AdminHeaderProps) {
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <div className="bg-veluna-dark text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      {/* Left: brand + tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-extrabold text-lg flex-shrink-0">فيلونا Admin</h1>
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href || (tab.href === '/admin/orders' && pathname === '/admin')
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                  active
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Right: page-specific slot + logout */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {rightSlot}
        <button
          onClick={handleLogout}
          className="text-xs text-white/60 hover:text-white transition-colors"
        >
          خروج
        </button>
      </div>
    </div>
  )
}
