'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { deletePost } from '@/lib/actions/deletePost';
import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

type PostDropdownMenuProps = {
  postId: string;
};

export default function PostDropdownMenu({ postId }: PostDropdownMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);
    if (confirm('本当にこの投稿を削除しますか？')) {
      startTransition(async () => {
        const result = await deletePost(postId);
        if (result.success) {
          router.push('/dashboard');
          router.refresh();
        } else {
          alert(result.error || '削除に失敗しました');
        }
      });
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          type="button"
          className="h-8 w-8 p-0"
          aria-label="操作メニュー"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={5}>
        <DropdownMenuItem asChild>
          <Link href={`/manage/posts/${postId}`} onClick={() => setOpen(false)}>
            閲覧
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/manage/posts/${postId}/edit`} onClick={() => setOpen(false)}>
            編集
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

