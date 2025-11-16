'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { PostCardProps } from '@/types/post'

export function PostCard({ post }: PostCardProps) {
  const [imageError, setImageError] = useState(false);
  const isSupabaseImage = post.topImage?.includes('supabase.co') ?? false;

  return (
    <Card className="h-full flex flex-col">
      <Link href={`/posts/${post.id}`} className="flex flex-col h-full">
        {post.topImage && !imageError && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
            {isSupabaseImage ? (
              <img
                src={post.topImage}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <Image
                src={post.topImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
              />
            )}
          </div>
        )}
        <CardContent className="flex flex-col grow">
          <CardTitle className="mb-2">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-3 grow">
            {post.content}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{post.author.name}</span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ja,
              })}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
