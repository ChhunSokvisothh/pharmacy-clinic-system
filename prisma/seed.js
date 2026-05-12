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
}

main().catch(console.error).finally(() => prisma.$disconnect())