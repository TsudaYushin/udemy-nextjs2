'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { saveImage } from '@/utils/image';

type ActionState = {
  success: boolean;
  errors: Record<string, string[]>;
  redirectTo?: string;
};

export async function createPost(
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

    const title = formData.get('title')?.toString() ?? '';
    const content = formData.get('content')?.toString() ?? '';
    const published = formData.get('published') === 'on';
    const topImageFile = formData.get('topImage');

    // デバッグ用（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('FormData content:', {
        title,
        content,
        contentLength: content.length,
        contentTrimmed: content.trim(),
        contentTrimmedLength: content.trim().length,
      });
    }

    // バリデーション
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

    // 画像保存処理
    let imageUrl: string | null = null;
    if (topImageFile && topImageFile instanceof File && topImageFile.size > 0) {
      try {
        imageUrl = await saveImage(topImageFile);
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

    // Prismaを使用してデータベースに投稿を保存
    try {
      await prisma.post.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          topImage: imageUrl,
          published,
          authorId: userId,
        },
      });

      // 投稿作成成功後、クライアント側でリダイレクト
      return {
        success: true,
        errors: {},
        redirectTo: '/dashboard',
      };
    } catch (error) {
      // エラーの詳細を確認
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; message?: string };
        
        if (prismaError.code === 'P2002') {
          return {
            success: false,
            errors: {
              _form: ['投稿の作成に失敗しました。重複するデータが存在します。'],
            },
          };
        }
        
        if (prismaError.code === 'P2003') {
          return {
            success: false,
            errors: {
              _form: ['投稿の作成に失敗しました。ユーザー情報が無効です。'],
            },
          };
        }
        
        return {
          success: false,
          errors: {
            _form: [`投稿の作成に失敗しました。エラーコード: ${prismaError.code}`],
          },
        };
      }

      // その他のエラー
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      return {
        success: false,
        errors: {
          _form: [`投稿の作成に失敗しました: ${errorMessage}`],
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

