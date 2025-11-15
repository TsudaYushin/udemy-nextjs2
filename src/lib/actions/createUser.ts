'use server';

import { registerSchema } from '@/valitations/user';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signIn } from '@/auth';
import type { ZodError } from 'zod';

// ActionStateの型定義
type ActionState = {
  success: boolean;
  errors: Record<string, string[]>;
  redirectTo?: string; // リダイレクト先を追加
};

// バリデーションエラー処理
function handleValidationError(error: ZodError): ActionState {
const { fieldErrors, formErrors } = error.flatten();
  // fieldErrorsにundefinedが入らないようにキャスト
  const castedFieldErrors = fieldErrors as Record<string, string[]>;
  
if (formErrors.length > 0) {
    return {
      success: false,
      errors: {
        ...castedFieldErrors,
        confirmPassword: formErrors,
      },
    };
  }
  
  return { success: false, errors: castedFieldErrors };
}

// カスタムエラー処理
function handleError(customErrors: Record<string, string[]>): ActionState {
return { success: false, errors: customErrors };
}

export async function createUser(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    // 4つの値を取得
    const rawFormData = Object.fromEntries(
      ['name', 'email', 'password', 'confirmPassword'].map((field) => [
        field,
        formData.get(field) ?? '',
      ]),
    ) as Record<string, string>;

// バリデーション
const validationResult = registerSchema.safeParse(rawFormData);
    if (!validationResult.success) {
      return handleValidationError(validationResult.error);
    }

// メールアドレスが既に登録されているか確認
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: rawFormData.email },
      });
    } catch (dbError) {
      console.error('Database error checking existing user:', dbError);
      return handleError({
        _form: ['データベース接続エラーが発生しました。'],
      });
    }
    
if (existingUser) {
      return handleError({
        email: ['このメールアドレスはすでに登録されています'],
      });
}

// パスワードのハッシュ化
    let hashedPassword;
    try {
      hashedPassword = await bcryptjs.hash(rawFormData.password, 12);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return handleError({
        _form: ['パスワードの処理中にエラーが発生しました。'],
      });
    }

// ユーザー登録
    try {
await prisma.user.create({
    data: {
    name: rawFormData.name,
    email: rawFormData.email,
          password: hashedPassword,
        },
      });
    } catch (createError: unknown) {
      console.error('User creation error:', createError);
      
      // Prismaのユニーク制約エラーの場合
      if (
        createError &&
        typeof createError === 'object' &&
        'code' in createError &&
        createError.code === 'P2002'
      ) {
        return handleError({
          email: ['このメールアドレスはすでに登録されています'],
        });
      }
      
      // その他のPrismaエラー
      if (createError instanceof Error) {
        return handleError({
          _form: [`ユーザー登録に失敗しました: ${createError.message}`],
        });
      }
      
      return handleError({
        _form: ['ユーザー登録に失敗しました。'],
      });
    }

    // 自動ログインしてリダイレクト
    // 登録後にユーザーが確実にデータベースに保存されていることを確認してからログイン
    try {
      // データベースの反映を待つ（SQLiteの場合、即座に反映されるが念のため）
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // 登録したユーザーが確実に存在することを確認（emailで検索）
      const createdUser = await prisma.user.findUnique({
        where: { email: rawFormData.email },
      });
      
      if (!createdUser) {
        throw new Error('ユーザーの作成に失敗しました');
      }
      
      // ログインを試みる（最大3回リトライ）
      let loginSuccess = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
    await signIn('credentials', {
            email: rawFormData.email,
            password: rawFormData.password,
    redirect: false, // 自動リダイレクトを無効化
    });
          loginSuccess = true;
          break;
        } catch (retryError) {
          if (attempt < 2) {
            // リトライ前に少し待機
            await new Promise((resolve) => setTimeout(resolve, 200));
            continue;
          }
          throw retryError;
        }
      }
      
      if (loginSuccess) {
        // signInが成功した場合、リダイレクト先を返す
        // クライアント側でリダイレクトを処理する
        return { success: true, errors: {}, redirectTo: '/dashboard' };
      }
      
      // ログインに失敗した場合（リトライしても成功しなかった場合）
      // 登録は成功しているので、ログインページにリダイレクト
      return { success: true, errors: {}, redirectTo: '/login?registered=true' };
    } catch (signInError: unknown) {
      // ログインに失敗した場合でも、登録は成功している
      console.error('Login error after registration:', signInError);
      
      // AuthErrorの場合は詳細を確認
      if (signInError && typeof signInError === 'object' && 'type' in signInError) {
        console.error('AuthError type:', (signInError as { type: string }).type);
      }
      
      // 登録は成功しているので、ログインページにリダイレクトして手動ログインを促す
      return { success: true, errors: {}, redirectTo: '/login?registered=true' };
    }
  } catch (error) {
    // 予期しないエラー
    console.error('Unexpected error in createUser:', error);
    
    // エラーの詳細を取得
    let errorMessage = '登録中にエラーが発生しました。もう一度お試しください。';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Prismaのエラーの場合
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'このメールアドレスはすでに登録されています。';
      } else if (error.message.includes('Database')) {
        errorMessage = 'データベース接続エラーが発生しました。';
      } else if (error.message.includes('Prisma')) {
        errorMessage = 'データベースエラーが発生しました。';
      }
    }
    
    return handleError({
      _form: [errorMessage],
    });
  }
}
