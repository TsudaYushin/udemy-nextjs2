# Vercel環境変数設定ガイド

## 必要な環境変数一覧

Vercelのダッシュボードで以下の環境変数を設定してください。

### 1. Production（本番環境）

```
DATABASE_URL=postgresql://ユーザー名:パスワード@ホスト:ポート/データベース名?sslmode=require
AUTH_SECRET=ランダムな文字列（openssl rand -base64 32で生成）
AUTH_URL=https://あなたのドメイン.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://kyufyxtzlujvkdtyqrfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
NEXT_PUBLIC_SUPABASE_BUCKET_NAME=Udemy-next-blog
NEXT_PUBLIC_USE_SUPABASE_STORAGE=true
```

### 2. Preview（プレビュー環境）

```
DATABASE_URL=postgresql://ユーザー名:パスワード@ホスト:ポート/データベース名?sslmode=require
AUTH_SECRET=ランダムな文字列（本番とは別の値）
AUTH_URL=https://あなたのプレビューURL.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://kyufyxtzlujvkdtyqrfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
NEXT_PUBLIC_SUPABASE_BUCKET_NAME=Udemy-next-blog
NEXT_PUBLIC_USE_SUPABASE_STORAGE=true
```

### 3. Development（開発環境）

```
DATABASE_URL=postgresql://ユーザー名:パスワード@ホスト:ポート/データベース名?sslmode=require
AUTH_SECRET=ランダムな文字列（開発用）
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://kyufyxtzlujvkdtyqrfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
NEXT_PUBLIC_SUPABASE_BUCKET_NAME=Udemy-next-blog
NEXT_PUBLIC_USE_SUPABASE_STORAGE=true
```

### 4. 環境変数の説明

#### DATABASE_URL
- PostgreSQLデータベースの接続URL
- Supabaseの場合は、Supabaseダッシュボード → Settings → Database → Connection string から取得
- 形式: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres?sslmode=require`

#### AUTH_SECRET
- NextAuthのシークレットキー
- 生成方法: `openssl rand -base64 32` を実行
- 各環境で異なる値を設定することを推奨

#### AUTH_URL
- NextAuthのベースURL
- Production: `https://あなたのドメイン.vercel.app`
- Preview: `https://あなたのプレビューURL.vercel.app`
- Development: `http://localhost:3000`

#### NEXT_PUBLIC_SUPABASE_URL
- SupabaseプロジェクトのURL
- Supabaseダッシュボード → Settings → API → Project URL から取得
- 例: `https://kyufyxtzlujvkdtyqrfm.supabase.co`

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- Supabaseの匿名キー（公開キー）
- Supabaseダッシュボード → Settings → API → Project API keys → anon public から取得
- **注意**: これは公開キーなので、クライアント側で使用されます

#### NEXT_PUBLIC_SUPABASE_BUCKET_NAME
- Supabaseストレージのバケット名
- デフォルト: `Udemy-next-blog`
- バケット名が異なる場合は変更してください

#### NEXT_PUBLIC_USE_SUPABASE_STORAGE
- Supabaseストレージを使用するかどうか
- `true`: Supabaseストレージを使用
- `false`: ローカルストレージを使用（Vercelでは通常`true`を推奨）

## Vercelでの設定手順

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. Settings → Environment Variables を開く
4. 各環境（Production, Preview, Development）に対して上記の環境変数を追加
5. 各環境変数の値を入力
6. Save をクリック

## 注意事項

- `NEXT_PUBLIC_`で始まる環境変数はクライアント側で公開されます
- `AUTH_SECRET`は機密情報なので、絶対に公開しないでください
- 各環境で異なる`AUTH_SECRET`を使用することを推奨します
- `DATABASE_URL`も機密情報なので、公開しないでください

