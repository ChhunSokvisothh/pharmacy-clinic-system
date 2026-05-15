'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: '📊 Dashboard' },
    { href: '/pharmacy', label: '💊 POS' },
    { href: '/pharmacy/inventory', label: '📦 Inventory' },
    { href: '/pharmacy/sales', label: '📋 Sales' },
    { href: '/dental', label: '🦷 Dental' },
]
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="font-bold text-lg">Pharmacy & Clinic</h1>
          <p className="text-xs text-gray-400 mt-1">{session?.user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{session?.user?.role?.toLowerCase()}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}