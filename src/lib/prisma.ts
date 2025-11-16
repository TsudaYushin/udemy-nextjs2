import { PrismaClient } from '@prisma/client'
import path from 'path'

// グローバルスコープでPrismaインスタンスを保持できる場所を作る
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// データベースURLを取得し、相対パスの場合は絶対パスに変換
function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set')
  }
  
  // file:./prisma/dev.db のような形式の場合
  if (dbUrl.startsWith('file:./')) {
    const relativePath = dbUrl.replace('file:', '')
    const absolutePath = path.join(process.cwd(), relativePath)
    return `file:${absolutePath}`
  }
  
  return dbUrl
}

// 環境変数を動的に設定（相対パスの場合）
if (process.env.DATABASE_URL?.startsWith('file:./')) {
  process.env.DATABASE_URL = getDatabaseUrl()
}

// Prismaインスタンスがあれば使う、なければ作成
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// 開発環境でのみ使用
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma