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
                onError={async (e) => {
                  const target = e.target as HTMLImageElement;
                  console.error('=== 画像読み込みエラー ===');
                  console.error('画像URL:', post.topImage);
                  
                  // HTTPステータスコードを確認
                  try {
                    const response = await fetch(post.topImage, { method: 'HEAD' });
                    console.error('HTTPステータスコード:', response.status, response.statusText);
                    
                    if (response.status === 403) {
                      console.error('❌ 403 Forbidden: ストレージポリシー（RLS）が設定されていないか、バケットが公開設定になっていません');
                      console.error('解決方法:');
                      console.error('1. Supabaseダッシュボード → Storage → バケット → Settings → "Public bucket"を有効化');
                      console.error('2. SQL Editorで以下を実行:');
                      console.error('   DROP POLICY IF EXISTS "Public Access" ON storage.objects;');
                      console.error('   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = \'Udemy-next-blog\');');
                    } else if (response.status === 404) {
                      console.error('❌ 404 Not Found: ファイルが存在しないか、バケット名が間違っています');
                      console.error('解決方法:');
                      console.error('1. Supabaseダッシュボード → Storage でファイルが存在するか確認');
                      console.error('2. バケット名が正しいか確認（大文字小文字も重要）');
                    } else {
                      console.error('❌ その他のエラー:', response.status, response.statusText);
                    }
                  } catch (fetchError) {
                    console.error('HTTPステータス確認エラー:', fetchError);
                    console.error('ブラウザで直接URLにアクセスして確認してください:', post.topImage);
                  }
                  
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log('✅ 画像読み込み成功:', post.topImage);
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
