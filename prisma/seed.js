// primsa.対象テーブル名.メソッド のように記述
import { PrismaClient } from '../src/generated/prisma/client.js'
import bcrypt from 'bcryptjs'

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