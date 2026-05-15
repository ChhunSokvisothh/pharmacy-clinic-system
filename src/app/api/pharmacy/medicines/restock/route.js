import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { medicineId, quantity, costPrice } = await req.json()

  await prisma.restock.create({
    data: { medicineId, quantity, costPrice }
  })

  const medicine = await prisma.medicine.update({
    where: { id: medicineId },
    data: { stock: { increment: quantity } }
  })

  return NextResponse.json(medicine)
}