import Link from "next/link";
import { Button } from "@/components/ui/button";
import SearchBox from "@/components/post/SearchBox";
import { Home } from "lucide-react";
import { Suspense } from "react";

export function PublicHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center gap-2 sm:gap-4 px-2 sm:px-4">
        {/* ホームアイコン */}
        <Link href="/" className="px-2 py-2 ">
          <Home className="h-5 w-5" />
        </Link>

        {/* 検索バー */}
        <div className="flex-1 min-w-0 max-w-md mx-auto sm:mx-0">
          <Suspense fallback={<div className="h-9 w-full rounded bg-muted/40" />}> 
            <SearchBox />
          </Suspense>
        </div>

        {/* ログインボタン */}
        <div className="flex items-center gap-1 sm:gap-2 ">
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild>
            <Link href="/login">ログイン</Link>
          </Button>
          <Button size="sm" className="text-xs sm:text-sm" asChild>
            <Link href="/register">新規登録</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

