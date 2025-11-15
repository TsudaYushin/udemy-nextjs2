'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function createDummyPosts() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session?.user?.email || !userId) {
    return { success: false, error: 'ログインが必要です' };
  }

  try {
    const dummyPosts = [
      {
        title: 'はじめてのブログ投稿',
        content: 'これは最初のブログ投稿です。Next.jsとPrismaでブログを作成しています。',
        published: true,
        authorId: userId,
      },
      {
        title: '2番目の投稿',
        content: 'ブログの機能を少しずつ追加していきます。認証機能やダッシュボードなども実装予定です。',
        published: true,
        authorId: userId,
      },
      {
        title: '下書きの投稿',
        content: 'これは下書き状態の投稿です。公開する前に内容を確認してください。',
        published: false,
        authorId: userId,
      },
      {
        title: 'Next.jsの学習記録',
        content: 'Next.js App Routerを使った開発について学んでいます。Server ComponentsとClient Componentsの違いが面白いです。',
        published: true,
        authorId: userId,
      },
      {
        title: 'Prismaの使い方',
        content: 'Prismaを使ったデータベース操作についてまとめました。型安全性が高くて便利です。',
        published: true,
        authorId: userId,
      },
    ];

    await prisma.post.createMany({
      data: dummyPosts,
    });

    return { success: true, message: `${dummyPosts.length}件のダミーポストを作成しました` };
  } catch (error) {
    console.error('Error creating dummy posts:', error);
    return { success: false, error: 'ダミーポストの作成に失敗しました' };
  }
}

