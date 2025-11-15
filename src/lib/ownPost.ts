import { prisma } from '@/lib/prisma';

export async function getOwnPosts(userId: string) {
  const posts = await prisma.post.findMany({
    where: {
      authorId: userId
    },
          select: {
            id: true,
            title: true,
            topImage: true,
            published: true,
            createdAt: true,
            updatedAt: true,
          },
    orderBy: { createdAt: "desc" },
  });

  // デバッグ用（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('getOwnPosts Debug:', {
      userId,
      postsCount: posts.length,
      posts: posts.map(p => ({ id: p.id, title: p.title })),
    });
  }

  return posts;
}

export async function getOwnPost(userId: string, postId: string) {
    return await prisma.post.findFirst({
    where: {
    AND: [
    { authorId: userId },
    { id: postId }
    ]
    },
    select: {
    id: true,
    title: true,
    content: true,
    topImage: true,
    published: true,
    createdAt: true, updatedAt: true,
    }
    });
}
