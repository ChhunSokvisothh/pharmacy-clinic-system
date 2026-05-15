import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    todaySales,
    totalMedicines,
    lowStockMedicines,
    expiringSoon,
    recentSales,
    totalPatients,
    todayDentalVisits
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow } },
      _sum: { totalAmount: true },
      _count: true
    }),
    prisma.medicine.count(),
    prisma.medicine.count({
      where: { stock: { lte: prisma.medicine.fields.lowStockAt } }
    }),
    prisma.medicine.count({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { medicine: true } } }
    }),
    prisma.patient.count(),
    prisma.dentalVisit.count({
      where: { visitedAt: { gte: today, lt: tomorrow } }
    })
  ])

  return {
    todayRevenue: todaySales._sum.totalAmount ?? 0,
    todayTransactions: todaySales._count,
    totalMedicines,
    lowStockCount: lowStockMedicines,
    expiringSoonCount: expiringSoon,
    recentSales,
    totalPatients,
    todayDentalVisits
  }
}

export default async function HomePage() {
  const session = await auth()
  const data = await getDashboardData()
  const todayKHR = Math.round(data.todayRevenue * 4100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {session?.user?.name} 👋
        </h1>
        <p className="text-gray-500 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Alerts */}
      {(data.lowStockCount > 0 || data.expiringSoonCount > 0) && (
        <div className="flex gap-3">
          {data.lowStockCount > 0 && (
            <Link href="/pharmacy/inventory" className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3 hover:bg-red-100 transition-colors">
              <p className="text-red-600 font-semibold text-sm">⚠️ Low Stock Alert</p>
              <p className="text-red-500 text-xs mt-1">{data.lowStockCount} medicine{data.lowStockCount > 1 ? 's' : ''} running low — tap to restock</p>
            </Link>
          )}
          {data.expiringSoonCount > 0 && (
            <Link href="/pharmacy/inventory" className="flex-1 bg-orange-50 border border-orange-200 rounded-xl p-3 hover:bg-orange-100 transition-colors">
              <p className="text-orange-600 font-semibold text-sm">⏰ Expiring Soon</p>
              <p className="text-orange-500 text-xs mt-1">{data.expiringSoonCount} medicine{data.expiringSoonCount > 1 ? 's' : ''} expiring within 30 days</p>
            </Link>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-gray-500 text-sm">Today's Revenue</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">${data.todayRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">៛{todayKHR.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-gray-500 text-sm">Transactions Today</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{data.todayTransactions}</p>
          <p className="text-xs text-gray-400 mt-1">pharmacy sales</p>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-gray-500 text-sm">Total Medicines</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{data.totalMedicines}</p>
          <p className="text-xs text-gray-400 mt-1">in inventory</p>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-gray-500 text-sm">Dental Patients</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{data.totalPatients}</p>
          <p className="text-xs text-gray-400 mt-1">{data.todayDentalVisits} visit{data.todayDentalVisits !== 1 ? 's' : ''} today</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/pharmacy" className="bg-blue-600 text-white rounded-xl p-5 hover:bg-blue-700 transition-colors">
          <div className="text-3xl mb-2">💊</div>
          <h2 className="font-semibold text-lg">Open POS</h2>
          <p className="text-blue-200 text-sm mt-1">Start selling medicines</p>
        </Link>
        <Link href="/dental" className="bg-teal-600 text-white rounded-xl p-5 hover:bg-teal-700 transition-colors">
          <div className="text-3xl mb-2">🦷</div>
          <h2 className="font-semibold text-lg">Dental Clinic</h2>
          <p className="text-teal-200 text-sm mt-1">Manage patients and treatments</p>
        </Link>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Recent Sales</h2>
          <Link href="/pharmacy/sales" className="text-blue-500 text-sm hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Time</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Items</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.recentSales.length === 0 && (
              <tr><td colSpan={3} className="text-center py-6 text-gray-400">No sales yet today</td></tr>
            )}
            {data.recentSales.map(sale => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-500">
                  {new Date(sale.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {sale.items.map(i => i.medicine.name).join(', ')}
                </td>
                <td className="px-4 py-2 font-semibold text-blue-600">
                  ${sale.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}