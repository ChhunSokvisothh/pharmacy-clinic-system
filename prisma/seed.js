import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashed = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@pharmacy.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@pharmacy.com',
      password: hashed,
      role: 'ADMIN'
    }
  })

  console.log('Seed done! Login: admin@pharmacy.com / admin123')

  const meds = [
    { name: 'Paracetamol', brand: 'Tylenol', unit: 'tablet', costPrice: 0.05, sellPrice: 0.10, stock: 200, lowStockAt: 20 },
    { name: 'Amoxicillin', brand: 'Amoxil', unit: 'capsule', costPrice: 0.15, sellPrice: 0.30, stock: 150, lowStockAt: 15 },
    { name: 'Ibuprofen', brand: 'Advil', unit: 'tablet', costPrice: 0.08, sellPrice: 0.15, stock: 100, lowStockAt: 10 },
    { name: 'Vitamin C', brand: 'Celin', unit: 'tablet', costPrice: 0.05, sellPrice: 0.10, stock: 300, lowStockAt: 30 },
    { name: 'ORS Sachet', brand: null, unit: 'sachet', costPrice: 0.20, sellPrice: 0.50, stock: 80, lowStockAt: 10 },
    { name: 'Cetirizine', brand: 'Zyrtec', unit: 'tablet', costPrice: 0.10, sellPrice: 0.20, stock: 120, lowStockAt: 10 },
    { name: 'Omeprazole', brand: 'Losec', unit: 'capsule', costPrice: 0.12, sellPrice: 0.25, stock: 90, lowStockAt: 10 },
    { name: 'Metronidazole', brand: 'Flagyl', unit: 'tablet', costPrice: 0.08, sellPrice: 0.15, stock: 100, lowStockAt: 10 },
  ]

  for (const med of meds) {
    await prisma.medicine.upsert({
      where: { id: (await prisma.medicine.findFirst({ where: { name: med.name } }))?.id ?? 0 },
      update: {},
      create: med
    })
  }

  console.log('Medicines seeded!')
}

main().catch(console.error).finally(() => prisma.$disconnect())