// primsa.対象テーブル名.メソッド のように記述
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// .envファイルを読み込む
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '..', '.env')
try {
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=')
    if (key && values.length > 0) {
      const value = values.join('=').trim().replace(/^["']|["']$/g, '')
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value
      }
    }
  })
} catch (e) {
  console.warn('Could not load .env file:', e.message)
}

const require = createRequire(import.meta.url)
const { PrismaClient } = require('../src/generated/prisma/client.ts')
const bcrypt = require('bcryptjs')

async function main() {
  const prisma = new PrismaClient()
  // クリーンアップ
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()
  
  const hashedPassword = await bcrypt.hash('password123', 12) // 暗号化
  const dummyImages = [
    'https://picsum.photos/seed/post1/600/400', // ダミー画像
    'https://picsum.photos/seed/post2/600/400'
  ]

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      posts: {
        create: [
          {
            title: 'はじめてのブログ投稿',
            content: 'これは最初のブログ投稿です。Next.jsとPrismaでブログを作成しています。',
            topImage: dummyImages[0],
            published: true,
          },
          {
            title: '2番目の投稿',
            content: 'ブログの機能を少しずつ追加していきます。認証機能やダッシュボードなども実装予定です。',
            topImage: dummyImages[1],
            published: true,
          }
        ]
      }
    }
  })
  
  console.log({ user })
  
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })