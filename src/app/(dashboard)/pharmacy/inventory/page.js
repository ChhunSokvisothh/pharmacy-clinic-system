'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function InventoryPage() {
  const [medicines, setMedicines] = useState([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showRestock, setShowRestock] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '', brand: '', unit: '', costPrice: '', sellPrice: '',
    stock: '', lowStockAt: 10, expiryDate: ''
  })
  const [restockQty, setRestockQty] = useState('')
  const [restockCost, setRestockCost] = useState('')

  useEffect(() => { fetchMedicines() }, [])

  async function fetchMedicines() {
    const res = await fetch('/api/pharmacy/medicines')
    const data = await res.json()
    setMedicines(data)
  }

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.brand?.toLowerCase().includes(search.toLowerCase())
  )

  const lowStock = medicines.filter(m => m.stock <= m.lowStockAt)
  const expiringSoon = medicines.filter(m => {
    if (!m.expiryDate) return false
    const days = (new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    return days <= 30 && days > 0
  })
  const expired = medicines.filter(m => {
    if (!m.expiryDate) return false
    return new Date(m.expiryDate) < new Date()
  })

  async function handleAdd() {
    setLoading(true)
    await fetch('/api/pharmacy/medicines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        costPrice: parseFloat(form.costPrice),
        sellPrice: parseFloat(form.sellPrice),
        stock: parseInt(form.stock),
        lowStockAt: parseInt(form.lowStockAt),
        expiryDate: form.expiryDate || null
      })
    })
    setShowAdd(false)
    setForm({ name: '', brand: '', unit: '', costPrice: '', sellPrice: '', stock: '', lowStockAt: 10, expiryDate: '' })
    setSuccess('Medicine added!')
    setTimeout(() => setSuccess(''), 3000)
    fetchMedicines()
    setLoading(false)
  }

  async function handleRestock() {
    setLoading(true)
    await fetch('/api/pharmacy/medicines/restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicineId: selected.id,
        quantity: parseInt(restockQty),
        costPrice: parseFloat(restockCost)
      })
    })
    setShowRestock(false)
    setRestockQty('')
    setRestockCost('')
    setSuccess('Stock updated!')
    setTimeout(() => setSuccess(''), 3000)
    fetchMedicines()
    setLoading(false)
  }

  function getStockBadge(m) {
    if (m.stock === 0) return <Badge variant="destructive">Out of stock</Badge>
    if (m.stock <= m.lowStockAt) return <Badge variant="destructive">Low stock</Badge>
    return <Badge variant="secondary">{m.stock} {m.unit}s</Badge>
  }

  function getExpiryBadge(m) {
    if (!m.expiryDate) return null
    const days = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0) return <Badge variant="destructive">Expired</Badge>
    if (days <= 30) return <Badge className="bg-orange-500 text-white">Expires in {days}d</Badge>
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 Inventory</h1>
          <p className="text-gray-500 text-sm">Manage medicines and stock levels</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Add Medicine</Button>
      </div>

      {/* Alerts */}
      {(lowStock.length > 0 || expiringSoon.length > 0 || expired.length > 0) && (
        <div className="grid grid-cols-3 gap-3">
          {lowStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 font-semibold text-sm">⚠️ Low Stock</p>
              <p className="text-red-500 text-xs mt-1">{lowStock.map(m => m.name).join(', ')}</p>
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <p className="text-orange-600 font-semibold text-sm">⏰ Expiring Soon</p>
              <p className="text-orange-500 text-xs mt-1">{expiringSoon.map(m => m.name).join(', ')}</p>
            </div>
          )}
          {expired.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-gray-600 font-semibold text-sm">❌ Expired</p>
              <p className="text-gray-500 text-xs mt-1">{expired.map(m => m.name).join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 text-sm px-4 py-2 rounded-md">✅ {success}</div>
      )}

      <Input
        placeholder="Search medicines..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Medicine Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Medicine</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cost</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Expiry</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{m.name}</p>
                  {m.brand && <p className="text-xs text-gray-400">{m.brand}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{m.unit}</td>
                <td className="px-4 py-3 text-gray-600">${m.costPrice.toFixed(2)}</td>
                <td className="px-4 py-3 font-medium text-blue-600">${m.sellPrice.toFixed(2)}</td>
                <td className="px-4 py-3">{getStockBadge(m)}</td>
                <td className="px-4 py-3">{getExpiryBadge(m) ?? <span className="text-gray-300 text-xs">—</span>}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { setSelected(m); setRestockCost(m.costPrice); setShowRestock(true) }}
                    className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                  >Restock</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Medicine Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Medicine name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Brand (optional)" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
            <Input placeholder="Unit (tablet, bottle, box...)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Cost price ($)" type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} />
              <Input placeholder="Sell price ($)" type="number" value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Initial stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              <Input placeholder="Low stock alert at" type="number" value={form.lowStockAt} onChange={e => setForm({ ...form, lowStockAt: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Expiry Date (optional)</label>
              <Input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={loading || !form.name || !form.sellPrice}>
              {loading ? 'Adding...' : 'Add Medicine'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={showRestock} onOpenChange={setShowRestock}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock — {selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Current stock: <span className="font-semibold text-gray-800">{selected?.stock} {selected?.unit}s</span></p>
            <Input placeholder="Quantity to add" type="number" value={restockQty} onChange={e => setRestockQty(e.target.value)} />
            <Input placeholder="Cost price per unit ($)" type="number" value={restockCost} onChange={e => setRestockCost(e.target.value)} />
            <Button className="w-full" onClick={handleRestock} disabled={loading || !restockQty}>
              {loading ? 'Updating...' : 'Confirm Restock'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}