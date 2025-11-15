'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session?.user?.email || !userId) {
      return {
        success: false,
        error: 'ログインが必要です',
      };
    }

    if (!postId) {
      return {
        success: false,
        error: '投稿IDが指定されていません',
      };
    }

    // 投稿が存在し、ユーザーが所有者であることを確認
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
      },
    });

    if (!existingPost) {
      return {
        success: false,
        error: '投稿が見つからないか、削除権限がありません',
      };
    }

    // 画像ファイルを削除
    if (existingPost.topImage && existingPost.topImage.startsWith('/images/')) {
      try {
        const imagePath = path.join(process.cwd(), 'public', existingPost.topImage);
        if (existsSync(imagePath)) {
          await unlink(imagePath);
        }
      } catch {
        // ファイル削除に失敗した場合はエラーを無視
      }
    }

    // 投稿を削除
    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    // キャッシュを再検証
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return {
      success: false,
      error: `投稿の削除に失敗しました: ${errorMessage}`,
    };
  }
}

