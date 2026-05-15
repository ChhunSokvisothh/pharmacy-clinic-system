'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const KHR_RATE = 4100

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/pharmacy/medicines')
      .then(r => r.json())
      .then(setMedicines)
  }, [])

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.brand?.toLowerCase().includes(search.toLowerCase()))
  )

  function addToCart(medicine) {
    setCart(prev => {
      const existing = prev.find(i => i.id === medicine.id)
      if (existing) {
        return prev.map(i => i.id === medicine.id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.sellPrice }
          : i
        )
      }
      return [...prev, { ...medicine, quantity: 1, subtotal: medicine.sellPrice }]
    })
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  function updateQty(id, qty) {
    if (qty < 1) return removeFromCart(id)
    setCart(prev => prev.map(i => i.id === id
      ? { ...i, quantity: qty, subtotal: qty * i.sellPrice }
      : i
    ))
  }

  const totalUSD = cart.reduce((sum, i) => sum + i.subtotal, 0)
  const totalKHR = Math.round(totalUSD * KHR_RATE)

  async function handleCheckout() {
    if (cart.length === 0) return
    setLoading(true)
    const res = await fetch('/api/pharmacy/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, currency, totalAmount: totalUSD })
    })
    if (res.ok) {
      setCart([])
      setSearch('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      // refresh medicines to update stock
      fetch('/api/pharmacy/medicines').then(r => r.json()).then(setMedicines)
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Left — Medicine Search */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">💊 Pharmacy POS</h1>
          <p className="text-gray-500 text-sm">Search and add medicines to cart</p>
        </div>

        <Input
          placeholder="Search medicine or brand..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3 overflow-y-auto">
          {filtered.map(m => (
            <button
              key={m.id}
              onClick={() => addToCart(m)}
              className="text-left bg-white rounded-xl p-4 border shadow-sm hover:shadow-md hover:border-blue-400 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{m.name}</p>
                  {m.brand && <p className="text-xs text-gray-400">{m.brand}</p>}
                  <p className="text-xs text-gray-400 mt-1">{m.unit}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">${m.sellPrice.toFixed(2)}</p>
                  <Badge variant={m.stock <= m.lowStockAt ? 'destructive' : 'secondary'} className="text-xs mt-1">
                    {m.stock} left
                  </Badge>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-400 text-sm col-span-2 text-center py-8">No medicines found</p>
          )}
        </div>
      </div>

      {/* Right — Cart */}
      <div className="w-80 flex flex-col gap-3">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">🛒 Cart</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {cart.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Cart is empty</p>
            )}
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">${item.sellPrice.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold"
                  >-</button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold"
                  >+</button>
                </div>
                <p className="text-sm font-semibold w-14 text-right">${item.subtotal.toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none"
                >×</button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Total & Checkout */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrency('USD')}
                className={`flex-1 py-1 rounded-md text-sm font-medium border transition-colors ${currency === 'USD' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
              >USD</button>
              <button
                onClick={() => setCurrency('KHR')}
                className={`flex-1 py-1 rounded-md text-sm font-medium border transition-colors ${currency === 'KHR' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
              >KHR</button>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">
                  {currency === 'USD' ? `$${totalUSD.toFixed(2)}` : `៛${totalKHR.toLocaleString()}`}
                </span>
              </div>
              {currency === 'KHR' && (
                <p className="text-xs text-gray-400 text-right mt-1">≈ ${totalUSD.toFixed(2)} USD</p>
              )}
            </div>

            {success && (
              <div className="bg-green-50 text-green-600 text-sm text-center py-2 rounded-md">
                ✅ Sale recorded!
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
            >
              {loading ? 'Processing...' : 'Confirm Sale'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}