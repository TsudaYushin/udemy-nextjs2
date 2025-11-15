import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // authはユーザーセッションが含まれる
      const isLoggedIn = !!auth?.user; // ユーザーがログインしているか
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/manage');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return NextResponse.redirect(new URL('/login', nextUrl)); // ログインしてなければloginページにリダイレクト
      } else if (isLoggedIn && nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // ログインオプション auth/index.ts側で設定
} satisfies NextAuthConfig;