import 'dotenv/config'
import { defineConfig } from '@prisma/config'
import path from 'node:path'

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://smartcloud:smartcloud_password@localhost:5432/smart_device_cloud',
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})