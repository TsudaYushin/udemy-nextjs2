import { auth } from '@/auth';
import { getOwnPost } from '@/lib/ownPost';
import { notFound } from 'next/navigation';
import EditPostForm from './EditPostForm';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPage({ params }: PageProps) {
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
      <h1 className="text-3xl font-bold mb-6">記事の編集</h1>
      <EditPostForm post={post} />
    </div>
  );
}