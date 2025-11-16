import { PrismaClient } from '@prisma/client'

// Next.js + Prisma 推奨のシングルトンパターン
// 開発時のHMRでもインスタンスを再利用し、接続過多を防ぐ
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma: PrismaClient = global.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}