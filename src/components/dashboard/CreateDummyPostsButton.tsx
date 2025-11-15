'use client';

import { Button } from '@/components/ui/button';
import { createDummyPosts } from '@/lib/actions/createDummyPosts';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateDummyPostsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const result = await createDummyPosts();
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'エラーが発生しました');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? '作成中...' : 'ダミーデータを作成'}
    </Button>
  );
}

