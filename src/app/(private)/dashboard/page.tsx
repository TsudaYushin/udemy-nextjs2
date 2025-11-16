import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getOwnPosts } from '@/lib/ownPost';
import PostDropdownMenu from '@/components/post/PostDropdownMenu';
import CreateDummyPostsButton from '@/components/dashboard/CreateDummyPostsButton';
import Image from 'next/image';

// キャッシュを無効化して常に最新データを取得
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session?.user?.email || !userId) {
    throw new Error('不正なリクエストです');
  }

  const posts = await getOwnPosts(userId);

  // デバッグ用（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('Dashboard Debug:', {
      userId,
      userEmail: session.user.email,
      postsCount: Array.isArray(posts) ? posts.length : 0,
      posts: (Array.isArray(posts) ? posts : []).map(p => ({ id: p.id, title: p.title })),
    });
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">✅管理ページ
          </h1>
          <p className="text-muted-foreground mt-2">
            ようこそ、{session.user.name || session.user.email}さん
          </p>
        </div>
        <Button asChild>
          <Link href="/manage/posts/create">新規記事作成</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">名前:</span> {session.user.name || '未設定'}
              </p>
              <p className="text-sm">
                <span className="font-medium">メールアドレス:</span> {session.user.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">自分の投稿一覧</h2>
          {Array.isArray(posts) && posts.length === 0 && <CreateDummyPostsButton />}
        </div>
        {Array.isArray(posts) && posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="mb-4">投稿がありません</p>
              <CreateDummyPostsButton />
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="border p-2 text-left">画像</th>
                  <th className="border p-2 text-left">タイトル</th>
                  <th className="border p-2 text-center">状態</th>
                  <th className="border p-2 text-center">更新日</th>
                  <th className="border p-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(posts) ? posts : []).map((post) => (
                  <tr key={post.id}>
                    <td className="border p-2">
                      {post.topImage ? (
                        <div className="relative w-20 h-20 overflow-hidden rounded">
                          {post.topImage.includes('supabase.co') ? (
                            <Image
                              src={post.topImage}
                              alt={post.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <Image
                              src={post.topImage}
                              alt={post.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">画像なし</span>
                      )}
                    </td>
                    <td className="border p-2">{post.title}</td>
                    <td className="border p-2 text-center">
                      {post.published ? '表示' : '非表示'}
                    </td>
                    <td className="border p-2 text-center">
                      {new Date(post.updatedAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="border p-2 text-center">
                      <div className="flex justify-center">
                        <PostDropdownMenu postId={post.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

