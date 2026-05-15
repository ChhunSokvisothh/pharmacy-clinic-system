import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  const start = new Date(date)
  const end = new Date(date)
  end.setDate(end.getDate() + 1)

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start, lt: end } },
    include: { items: { include: { medicine: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(sales)
}

export async function POST(req) {
  const session = await auth()
  const { cart, currency, totalAmount } = await req.json()

  const sale = await prisma.sale.create({
    data: {
      totalAmount,
      currency,
      userId: parseInt(session.user.id),
      items: {
        create: cart.map(item => ({
          medicineId: item.id,
          quantity: item.quantity,
          unitPrice: item.sellPrice,
          subtotal: item.subtotal
        }))
      }
    }
  })

  await Promise.all(cart.map(item =>
    prisma.medicine.update({
      where: { id: item.id },
      data: { stock: { decrement: item.quantity } }
    })
  ))

  return NextResponse.json(sale)
}