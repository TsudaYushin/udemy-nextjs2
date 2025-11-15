'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActionState, useEffect } from 'react';
import { createUser } from '@/lib/actions/createUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ActionState = {
  success: boolean;
  errors: Record<string, string[]>;
  redirectTo?: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createUser,
    { success: false, errors: {} },
  );

  // リダイレクト処理
  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state.redirectTo, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>新規登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="山田太郎"
                required
                disabled={isPending}
              />
              {state.errors.name && (
                <div className="text-sm text-red-500">
                  {state.errors.name.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@example.com"
                required
                disabled={isPending}
              />
              {state.errors.email && (
                <div className="text-sm text-red-500">
                  {state.errors.email.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="8文字以上32文字以内"
                required
                disabled={isPending}
                minLength={8}
                maxLength={32}
              />
              {state.errors.password && (
                <div className="text-sm text-red-500">
                  {state.errors.password.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">確認用パスワード</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="パスワードを再入力"
                required
                disabled={isPending}
                minLength={8}
                maxLength={32}
              />
              {state.errors.confirmPassword && (
                <div className="text-sm text-red-500">
                  {state.errors.confirmPassword.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            {state.errors._form && (
              <div className="text-sm text-red-500">
                {state.errors._form.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? '登録中...' : '新規登録'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              すでにアカウントをお持ちですか？{' '}
              <Link href="/login" className="text-primary hover:underline">
                ログイン
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

