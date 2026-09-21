import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { DEVICE_PROFILE_SEEDS } from './generators/device-profiles'
import { TENANT_SEEDS } from './generators/tenants'
import { seedWorkflows } from './generators/workflows'
import { seedAlerts, seedCost } from './generators/analytics'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  for (const t of TENANT_SEEDS) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: t.slug },
      create: { slug: t.slug, name: t.name, plan: t.plan, status: t.status },
      update: {},
    })

    // Users
    for (const u of t.users) {
      await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
        create: {
          tenantId: tenant.id,
          email: u.email,
          role: u.role,
          status: 'ACTIVE',
          passwordHash: '$2b$10$seedpwdhash',     // replace with real hash
        },
        update: {},
      })
    }

    // Device profiles
    for (const p of DEVICE_PROFILE_SEEDS) {
      await prisma.deviceProfile.upsert({
        where: { tenantId_slug: { tenantId: tenant.id, slug: p.slug } },
        create: { tenantId: tenant.id, ...p, status: 'published' },
        update: {},
      })
    }

    await seedWorkflows(prisma, tenant.id)
    await seedAlerts(prisma, tenant.id, 25)
    await seedCost(prisma, tenant.id, 90)
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())