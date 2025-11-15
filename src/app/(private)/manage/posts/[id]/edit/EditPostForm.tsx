'use client';

import { useState, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { updatePost } from '@/lib/actions/updatePost';
import 'highlight.js/styles/github.css';

type EditPostFormProps = {
  post: {
    id: string;
    title: string;
    content: string;
    topImage: string | null;
    published: boolean;
  };
};

type ActionState = {
  success: boolean;
  errors: Record<string, string[]>;
  redirectTo?: string;
};

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(post.content);
  const [contentLength, setContentLength] = useState(post.content.length);
  const [preview, setPreview] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post.topImage);
  const [published, setPublished] = useState(post.published);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updatePost,
    { success: false, errors: {} },
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    setContentLength(value.length);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    if (file) {
      // プレビュー用URL生成 ブラウザのメモリに保存される
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // リダイレクト処理
  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state.success, state.redirectTo, router]);

  // プレビューURLはブラウザのメモリに保存される
  // コンポーネントが破棄されるかimagePreview変更時に プレビューURLを解放
  useEffect(() => {
    return () => {
      // URL.createObjectURLで生成されたURLのみ解放する
      if (imagePreview && imagePreview !== post.topImage && imagePreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch (error) {
          // 既に解放されている場合はエラーを無視
          console.warn('Failed to revoke object URL:', error);
        }
      }
    };
  }, [imagePreview, post.topImage]);

  return (
    <form action={formAction} className="space-y-6">
      {/* 隠しフィールドでcontentとtitleを確実に送信 */}
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="postId" value={post.id} />
      <input type="hidden" name="oldImageUrl" value={post.topImage || ''} />

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="記事のタイトルを入力"
              value={title}
              onChange={handleTitleChange}
              required
              disabled={isPending}
            />
            {state.errors.title && (
              <div className="text-sm text-red-500">
                {state.errors.title.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="topImage">トップ画像</Label>
            <Input
              type="file"
              id="topImage"
              accept="image/*"
              name="topImage"
              onChange={handleImageChange}
              disabled={isPending}
            />
            {imagePreview && (
              <div className="relative w-full h-48 overflow-hidden rounded-md border">
                <Image
                  src={imagePreview}
                  alt="プレビュー"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  unoptimized={imagePreview.startsWith('blob:')}
                />
              </div>
            )}
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                選択されたファイル: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
            {state.errors.topImage && (
              <div className="text-sm text-red-500">
                {state.errors.topImage.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">内容（Markdown）</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {contentLength}文字
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreview(!preview)}
                >
                  {preview ? '編集' : 'プレビュー'}
                </Button>
              </div>
            </div>
            {!preview ? (
              <TextareaAutosize
                id="content"
                value={content}
                onChange={handleContentChange}
                className="w-full border rounded-md p-2 min-h-[300px]"
                minRows={12}
                placeholder="Markdown形式で入力してください"
                required
                disabled={isPending}
              />
            ) : (
              <div className="border rounded-md p-6 bg-muted/30 min-h-[300px] overflow-auto">
                <div className="markdown-preview">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {content || '*内容を入力してください*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            {state.errors.content && (
              <div className="text-sm text-red-500">
                {state.errors.content.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>公開設定</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={published ? 'true' : 'false'}
            onValueChange={(value) => setPublished(value === 'true')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="published-true" disabled={isPending} />
              <Label htmlFor="published-true" className="cursor-pointer">
                公開する
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="published-false" disabled={isPending} />
              <Label htmlFor="published-false" className="cursor-pointer">
                非公開
              </Label>
            </div>
          </RadioGroup>
          <input type="hidden" name="published" value={published ? 'true' : 'false'} />
        </CardContent>
      </Card>

      {state.errors._form && (
        <div className="text-sm text-red-500">
          {state.errors._form.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? '更新中...' : '投稿を更新'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
