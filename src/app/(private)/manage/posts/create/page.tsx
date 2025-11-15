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
import { createPost } from '@/lib/actions/createPost';
import 'highlight.js/styles/github.css';

type ActionState = {
  success: boolean;
  errors: Record<string, string[]>;
  redirectTo?: string;
};

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [contentLength, setContentLength] = useState(0);
  const [preview, setPreview] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [published, setPublished] = useState(true);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createPost,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPublished(e.target.checked);
  };

  // リダイレクト処理
  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state.success, state.redirectTo, router]);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">新規記事作成</h1>

      <form action={formAction} className="space-y-6">
        {/* 隠しフィールドでcontentとtitleを確実に送信 */}
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="title" value={title} />
        
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
                onChange={handleFileChange}
                disabled={isPending}
              />
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={published}
                onChange={handlePublishedChange}
                className="rounded border-gray-300"
                disabled={isPending}
              />
              <Label htmlFor="published" className="cursor-pointer">
                公開する
              </Label>
            </div>
          </CardContent>
        </Card>

        {state.errors._form && (
          <div className="text-sm text-red-500">
            {state.errors._form.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}

        {/* フォーム情報の表示（デバッグ用） */}
        {process.env.NODE_ENV === 'development' && (
          <Card>
            <CardHeader>
              <CardTitle>フォーム情報（開発モード）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>タイトル:</strong> {title || '(未入力)'}</p>
                <p><strong>内容:</strong> {contentLength}文字</p>
                <p><strong>公開設定:</strong> {published ? '公開' : '非公開'}</p>
                <p><strong>画像ファイル:</strong> {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)` : 'なし'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? '作成中...' : '投稿を作成'}
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
    </div>
  );
}

