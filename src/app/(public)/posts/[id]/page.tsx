import { getPost } from '@/lib/post';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

type Params = {
  params: Promise<{ id: string }>;
};

export default async function PostPage({ params }: Params) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
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
            <span>{post.author.name}</span>
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