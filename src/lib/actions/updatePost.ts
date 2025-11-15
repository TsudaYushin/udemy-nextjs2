'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { saveImage } from '@/utils/image';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

type ActionState = {
  success: boolean;
  errors: Record<string, string[]>;
  redirectTo?: string;
};

export async function updatePost(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session?.user?.email || !userId) {
      return {
        success: false,
        errors: {
          _form: ['ログインが必要です'],
        },
      };
    }

    const postId = formData.get('postId') as string;
    const title = formData.get('title')?.toString() ?? '';
    const content = formData.get('content')?.toString() ?? '';
    const published = formData.get('published') === 'true';
    const topImage = formData.get('topImage');
    const oldImageUrl = formData.get('oldImageUrl') as string;

    // バリデーション
    if (!postId) {
      return {
        success: false,
        errors: {
          _form: ['投稿IDが指定されていません'],
        },
      };
    }

    if (!title || !title.trim()) {
      return {
        success: false,
        errors: {
          title: ['タイトルは必須です'],
        },
      };
    }

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        errors: {
          content: ['内容は必須です'],
        },
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
        errors: {
          _form: ['投稿が見つからないか、編集権限がありません'],
        },
      };
    }

    // 画像保存処理
    let imageUrl = oldImageUrl;
    if (topImage instanceof File && topImage.size > 0) {
      try {
        const newImageUrl = await saveImage(topImage);
        if (!newImageUrl) {
          return {
            success: false,
            errors: {
              topImage: ['画像の保存に失敗しました'],
            },
          };
        }
        imageUrl = newImageUrl;
        
        // 古い画像を削除（新しい画像が正常に保存された場合のみ）
        if (oldImageUrl && oldImageUrl.startsWith('/images/')) {
          try {
            const oldImagePath = path.join(process.cwd(), 'public', oldImageUrl);
            if (existsSync(oldImagePath)) {
              await unlink(oldImagePath);
            }
          } catch {
            // ファイル削除に失敗した場合はエラーを無視
          }
        }
      } catch (imageError) {
        const errorMessage = imageError instanceof Error ? imageError.message : '画像の保存に失敗しました。';
        return {
          success: false,
          errors: {
            topImage: [errorMessage],
          },
        };
      }
    }

    // DB更新
    try {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          title: title.trim(),
          content: content.trim(),
          published,
          topImage: imageUrl,
        },
      });

      // 投稿更新成功後、クライアント側でリダイレクト
      return {
        success: true,
        errors: {},
        redirectTo: '/dashboard',
      };
    } catch (error) {
      // エラーの詳細を確認
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; message?: string };
        
        if (prismaError.code === 'P2025') {
          return {
            success: false,
            errors: {
              _form: ['投稿が見つかりませんでした'],
            },
          };
        }
        
        return {
          success: false,
          errors: {
            _form: [`投稿の更新に失敗しました。エラーコード: ${prismaError.code}`],
          },
        };
      }

      // その他のエラー
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      return {
        success: false,
        errors: {
          _form: [`投稿の更新に失敗しました: ${errorMessage}`],
        },
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return {
      success: false,
      errors: {
        _form: [`エラーが発生しました: ${errorMessage}`],
      },
    };
  }
}

