import { searchPosts, getPosts } from '@/lib/post'
import { PostCard } from '@/components/post/PostCard'
import type { Post } from '@/types/post'

export default async function PostsPage({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  try {
    const queryParam = searchParams?.search
    const query = Array.isArray(queryParam) ? queryParam[0] ?? '' : (queryParam ?? '')
    
    const posts: Post[] = query
      ? await searchPosts(query)
      : await getPosts()

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">記事一覧</h1>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">投稿がありません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error fetching posts:', error)
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">記事一覧</h1>
        <p className="text-red-500">エラーが発生しました。コンソールを確認してください。</p>
        <pre className="mt-4 text-sm bg-gray-100 p-4 rounded">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    )
  }
}

