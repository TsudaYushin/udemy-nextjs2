import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth } from '@/auth';
import { logout } from '@/lib/actions/logout';
import SearchBox from '@/components/post/SearchBox';
import { Home } from 'lucide-react';

export default async function PrivateHeader() {
  const session = await auth(); // サーバーサイドでセッション情報を取得

  if (!session?.user?.email) {
    throw new Error('不正なリクエストです');
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center gap-2 sm:gap-4 px-2 sm:px-4">
        {/* ホームアイコン */}
        <Link href="/posts" className="px-2 py-2 flex-shrink-0">
          <Home className="h-5 w-5" />
        </Link>

        {/* 検索バー */}
        <div className="flex-1 min-w-0 max-w-md mx-auto sm:mx-0">
          <SearchBox />
        </div>

        {/* ユーザー情報とログアウト */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {session.user.name || session.user.email}
          </span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm" className="text-xs sm:text-sm">
              ログアウト
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
