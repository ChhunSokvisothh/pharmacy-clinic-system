'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

const PERIODS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
]

function getDateRange(period) {
  const now = new Date()
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 1)

  if (period === 'today') {
    start.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    const day = now.getDay()
    start.setDate(now.getDate() - day)
    start.setHours(0, 0, 0, 0)
  } else if (period === 'month') {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
  } else if (period === 'year') {
    start.setMonth(0, 1)
    start.setHours(0, 0, 0, 0)
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [period, setPeriod] = useState('today')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (period !== 'custom') fetchSales()
  }, [period])

  useEffect(() => {
    if (period === 'custom' && customStart && customEnd) fetchSales()
  }, [customStart, customEnd])

  // auto refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (period !== 'custom') fetchSales()
    }, 30000)
    return () => clearInterval(interval)
  }, [period])

  async function fetchSales() {
    setLoading(true)
    let start, end

    if (period === 'custom') {
      if (!customStart || !customEnd) return
      start = new Date(customStart).toISOString()
      const endDate = new Date(customEnd)
      endDate.setDate(endDate.getDate() + 1)
      end = endDate.toISOString()
    } else {
      const range = getDateRange(period)
      start = range.start
      end = range.end
    }

    const res = await fetch(`/api/pharmacy/sales?start=${start}&end=${end}`)
    const data = await res.json()
    setSales(data)
    setLoading(false)
  }

  const totalUSD = sales.reduce((sum, s) => sum + s.totalAmount, 0)
  const totalKHR = Math.round(totalUSD * 4100)
  const avgSale = sales.length > 0 ? totalUSD / sales.length : 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📋 Sales History</h1>
        <p className="text-gray-500 text-sm">View and filter sales reports</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              period === p.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {period === 'custom' && (
        <div className="flex gap-3 items-center">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-gray-500 text-sm">Transactions</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{sales.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-gray-500 text-sm">Revenue (USD)</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">${totalUSD.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-gray-500 text-sm">Revenue (KHR)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">៛{totalKHR.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-gray-500 text-sm">Avg per Sale</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">${avgSale.toFixed(2)}</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date & Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Currency</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
            )}
            {!loading && sales.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No sales found</td></tr>
            )}
            {sales.map((sale, i) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-gray-600">
                  <p>{new Date(sale.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    {sale.items.map(item => (
                      <p key={item.id} className="text-gray-700">
                        {item.medicine.name} <span className="text-gray-400">x{item.quantity}</span>
                      </p>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{sale.currency}</Badge>
                </td>
                <td className="px-4 py-3 font-semibold text-blue-600">
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