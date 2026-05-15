import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const medicines = await prisma.medicine.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(medicines)
}

export async function POST(req) {
  const data = await req.json()
  const medicine = await prisma.medicine.create({ data })
  return NextResponse.json(medicine)
}