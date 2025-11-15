import { auth } from '@/auth';
import { getOwnPost } from '@/lib/ownPost';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostEditPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!session?.user?.email || !userId) {
    throw new Error('不正なリクエストです');
  }

  const post = await getOwnPost(userId, id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">投稿の編集</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">ダッシュボードに戻る</Link>
          </Button>
          <Button asChild>
            <Link href={`/manage/posts/${id}/edit`}>編集</Link>
          </Button>
        </div>
      </div>

      <Card>
        {post.topImage && (
          <div className="relative h-96 w-full overflow-hidden rounded-t-xl">
            {post.topImage.includes('supabase.co') ? (
              <img
                src={post.topImage}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={post.topImage}
                alt={post.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            )}
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-3xl mb-2">{post.title}</CardTitle>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>状態: {post.published ? '公開' : '非公開'}</span>
            <span>
              {format(new Date(post.createdAt), 'yyyy年MM月dd日', { locale: ja })}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

