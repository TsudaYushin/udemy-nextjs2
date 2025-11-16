import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance = globalForPrisma.prisma

if (!prismaInstance) {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Create a .env.local at project root and set DATABASE_URL to your Postgres connection string (e.g. Supabase).\n' +
      'Example: DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres?sslmode=require'
    )
  }
  
  try {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance
    }
  } catch (error) {
    console.error('Prisma Client initialization error:', error)
    throw new Error(
      `Failed to initialize Prisma Client.\n` +
      `Make sure you ran: npx prisma generate --schema=./prisma/schema.prisma\n` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

export const prisma = prismaInstance