# プロジェクト構造図とファイル役割説明

## 📁 プロジェクト全体構造

```
my-app/
├── 📄 設定ファイル
│   ├── package.json          # プロジェクトの依存関係とスクリプト定義
│   ├── next.config.ts        # Next.jsの設定（画像リモートパターンなど）
│   ├── tsconfig.json         # TypeScriptの設定（パスエイリアス含む）
│   ├── components.json        # shadcn/uiの設定
│   ├── eslint.config.mjs     # ESLintの設定
│   └── postcss.config.mjs    # PostCSSの設定
│
├── 📁 prisma/                # データベース関連
│   ├── schema.prisma         # データベーススキーマ定義（User, Postモデル）
│   ├── seed.ts               # データベースの初期データ投入スクリプト
│   ├── dev.db                # SQLiteデータベースファイル
│   └── migrations/           # データベースマイグレーションファイル
│
├── 📁 src/
│   ├── 📁 app/               # Next.js App Router（ページとレイアウト）
│   │   ├── layout.tsx        # ルートレイアウト（全ページ共通）
│   │   ├── globals.css       # グローバルスタイル（Tailwind CSS設定）
│   │   ├── favicon.ico       # ファビコン
│   │   │
│   │   ├── (public)/         # 公開ページグループ
│   │   │   ├── layout.tsx    # 公開ページ用レイアウト（PublicHeader含む）
│   │   │   ├── page.tsx      # トップページ（投稿一覧表示）
│   │   │   └── posts/
│   │   │       └── [id]/
│   │   │           ├── page.tsx      # 個別投稿詳細ページ
│   │   │           └── not-found.tsx # 投稿が見つからない場合のページ
│   │   │
│   │   ├── (auth)/           # 認証ページグループ（現在空）
│   │   └── (private)/        # 認証必須ページグループ（現在空）
│   │
│   ├── 📁 components/        # Reactコンポーネント
│   │   ├── 📁 layouts/
│   │   │   └── PublicHeader.tsx      # 公開ページ用ヘッダー（ナビゲーション、検索）
│   │   │
│   │   ├── 📁 post/
│   │   │   ├── PostCard.tsx          # 投稿カードコンポーネント（一覧表示用）
│   │   │   └── SearchBox .tsx        # 検索ボックスコンポーネント（クライアント）
│   │   │
│   │   └── 📁 ui/            # shadcn/uiコンポーネント
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── navigation-menu.tsx
│   │
│   ├── 📁 lib/               # ユーティリティとビジネスロジック
│   │   ├── prisma.ts         # Prismaクライアントの初期化と設定
│   │   ├── post.ts           # 投稿関連のデータ取得関数（getPosts, getPost, searchPosts）
│   │   └── utils.ts          # 汎用ユーティリティ関数（cn関数：クラス名マージ）
│   │
│   ├── 📁 types/              # TypeScript型定義
│   │   └── post.ts            # Post型とPostCardProps型の定義
│   │
│   └── 📁 generated/         # 自動生成ファイル（Prismaクライアント）
│       └── prisma/           # Prismaが生成する型定義とクライアント
│
└── 📁 public/                # 静的ファイル
    ├── file.svg
    ├── globe.svg
    ├── next.svg
    ├── vercel.svg
    └── window.svg
```

---

## 📋 各ファイルの詳細な役割

### 🔧 設定ファイル

#### `package.json`
プロジェクトの依存関係とスクリプトを定義するファイルです。Next.js、React、Prisma、shadcn/ui関連のパッケージが含まれています。`scripts`セクションには開発サーバー起動（`dev`）、ビルド（`build`）、本番起動（`start`）などのコマンドが定義されています。`prisma.seed`ではデータベースの初期データ投入方法が指定されています。

#### `next.config.ts`
Next.jsアプリケーションの設定ファイルです。`images.remotePatterns`で外部画像ドメイン（`picsum.photos`）を許可しており、Next.jsのImageコンポーネントで外部画像を安全に表示できるようにしています。

#### `tsconfig.json`
TypeScriptのコンパイラ設定です。`paths`セクションで`@/*`を`./src/*`にマッピングしており、`@/components`や`@/lib`のようなパスエイリアスを使用できます。これにより、相対パス（`../../../components`）ではなく、絶対パス（`@/components`）でインポートできます。

#### `components.json`
shadcn/uiの設定ファイルです。UIコンポーネントライブラリのスタイル（`new-york`）、パスエイリアス、Tailwind CSSの設定場所などを定義しています。

---

### 🗄️ データベース関連（prisma/）

#### `schema.prisma`
データベースのスキーマを定義するファイルです。`User`モデルと`Post`モデルが定義されており、それぞれのフィールドとリレーションシップが記述されています。`User`は`email`、`password`、`name`を持ち、`Post`は`title`、`content`、`topImage`、`published`を持ちます。`Post`は`authorId`で`User`と関連付けられており、ユーザーが削除されると関連する投稿も削除される（`onDelete: Cascade`）設定になっています。`generator`セクションでは、Prismaクライアントの生成先を`../src/generated/prisma`に指定しています。

#### `seed.ts`
データベースに初期データを投入するスクリプトです。開発環境でデータベースをリセットした際に、テスト用のデータを自動的に作成するために使用されます。

---

### 📄 アプリケーションページ（src/app/）

#### `layout.tsx`（ルート）
アプリケーション全体のルートレイアウトです。すべてのページに共通するHTML構造（`<html>`、`<body>`）を提供し、`globals.css`をインポートしてグローバルスタイルを適用します。`metadata`でページのタイトルと説明を定義しています。

#### `globals.css`
アプリケーション全体に適用されるCSSファイルです。Tailwind CSSをインポートし、カスタムCSS変数（`--background`、`--foreground`など）を定義して、ライトモードとダークモードのカラーパレットを設定しています。`@layer base`で基本的なスタイルを適用しています。

#### `(public)/layout.tsx`
公開ページ用のレイアウトコンポーネントです。`PublicHeader`コンポーネントを表示し、その下に子ページ（`children`）をレンダリングします。Next.jsのRoute Groups機能を使用して、公開ページをグループ化しています。

#### `(public)/page.tsx`
トップページ（投稿一覧ページ）です。URLパラメータ（`searchParams`）から検索クエリを取得し、クエリがある場合は`searchPosts`、ない場合は`getPosts`を呼び出して投稿データを取得します。取得した投稿を`PostCard`コンポーネントでグリッド表示し、エラーが発生した場合はエラーメッセージを表示します。

#### `(public)/posts/[id]/page.tsx`
個別投稿の詳細ページです。動的ルートパラメータ（`[id]`）から投稿IDを取得し、`getPost`関数で投稿データを取得します。投稿が見つからない場合は`notFound()`を呼び出して404ページを表示します。投稿のタイトル、画像、内容、作成日時、著者名を表示します。

#### `(public)/posts/[id]/not-found.tsx`
投稿が見つからない場合に表示される404ページです。`not-found.tsx`という名前により、Next.jsが自動的にこのコンポーネントを404エラー時に表示します。

---

### 🧩 コンポーネント（src/components/）

#### `layouts/PublicHeader.tsx`
公開ページ用のヘッダーコンポーネントです。ロゴ、ナビゲーションメニュー（ホーム、について、投稿一覧へのリンク）、検索ボックス（`SearchBox`）、ログイン・新規登録ボタンを表示します。`NavigationMenu`コンポーネントを使用してドロップダウンメニューを実装しています。

#### `post/PostCard.tsx`
投稿一覧で使用される投稿カードコンポーネントです。投稿の画像、タイトル、内容のプレビュー、著者名、作成日時（相対時間表示）を表示します。カード全体が`/posts/[id]`へのリンクになっており、クリックすると詳細ページに遷移します。`date-fns`の`formatDistanceToNow`を使用して「3時間前」のような相対時間を表示しています。

#### `post/SearchBox .tsx`
検索機能を提供するクライアントコンポーネントです。`useState`で検索入力値を管理し、`useEffect`でデバウンス処理（500ms待機）を実装して、入力が完了してからURLパラメータを更新します。これにより、ユーザーが入力中に何度も検索が実行されることを防いでいます。URLパラメータから初期値を取得し、検索クエリが変更されると`router.push`でURLを更新します。

#### `ui/*.tsx`
shadcn/uiから提供される再利用可能なUIコンポーネントです。`button`、`card`、`input`、`navigation-menu`など、アプリケーション全体で使用される基本的なUI部品を提供します。

---

### 🔨 ライブラリとユーティリティ（src/lib/）

#### `prisma.ts`
Prismaクライアントの初期化と設定を行うファイルです。開発環境ではグローバルスコープにPrismaインスタンスを保持して、ホットリロード時に複数のインスタンスが作成されることを防いでいます。`DATABASE_URL`が相対パス（`file:./prisma/dev.db`）の場合は、絶対パスに変換してから使用します。

#### `post.ts`
投稿データを取得するためのビジネスロジックを提供するファイルです。`getPosts`関数は公開済みの投稿を最新順で取得し、`getPost`関数はIDで特定の投稿を取得します。`searchPosts`関数は検索クエリを受け取り、タイトルと内容から検索ワードを検索します。全角・半角の正規化、大文字小文字の区別なし検索、複数ワードのAND検索などの機能を実装しています。

#### `utils.ts`
汎用的なユーティリティ関数を提供するファイルです。`cn`関数は`clsx`と`tailwind-merge`を組み合わせて、条件付きクラス名をマージし、Tailwind CSSのクラス名の競合を解決します。

---

### 📝 型定義（src/types/）

#### `post.ts`
投稿関連のTypeScript型定義を提供するファイルです。`Post`型は投稿データの構造を定義し、`id`、`title`、`content`、`topImage`、`createdAt`、`author`（`name`を含む）などのフィールドを持ちます。`PostCardProps`型は`PostCard`コンポーネントのpropsの型を定義しています。

---

### 🤖 自動生成ファイル（src/generated/）

#### `prisma/*`
Prismaが`schema.prisma`から自動生成するファイルです。データベースモデルに対応するTypeScript型定義と、データベース操作を行うためのクライアントコードが含まれています。これらのファイルは手動で編集せず、`prisma generate`コマンドで自動生成されます。

---

## 🔄 データフロー

### 投稿一覧ページの流れ
1. ユーザーがトップページ（`(public)/page.tsx`）にアクセス
2. `page.tsx`が`getPosts()`または`searchPosts()`を呼び出し
3. `post.ts`の関数が`prisma.ts`のPrismaクライアントを使用してデータベースからデータを取得
4. 取得したデータが`Post`型として返される
5. `PostCard`コンポーネントが各投稿を表示

### 検索機能の流れ
1. ユーザーが`SearchBox`に入力
2. デバウンス処理（500ms待機）により、入力が完了してからURLパラメータを更新
3. URLパラメータが変更されると、`page.tsx`が再レンダリング
4. `searchParams`から検索クエリを取得し、`searchPosts()`を呼び出し
5. 検索結果が表示される

### 投稿詳細ページの流れ
1. ユーザーが`PostCard`をクリックして`/posts/[id]`に遷移
2. `(public)/posts/[id]/page.tsx`が動的パラメータ`id`を取得
3. `getPost(id)`を呼び出して投稿データを取得
4. 投稿が見つからない場合は`notFound()`で404ページを表示
5. 投稿が見つかった場合は詳細情報を表示

---

## 🎯 主要な技術スタック

- **フレームワーク**: Next.js 15.5.6（App Router）
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS 4
- **UIコンポーネント**: shadcn/ui（Radix UIベース）
- **データベース**: SQLite（Prisma ORM）
- **日付処理**: date-fns
- **認証**: bcryptjs（準備中）

---

## 📌 重要な設計パターン

### Route Groups
`(public)`、`(auth)`、`(private)`のような括弧付きフォルダ名は、Next.jsのRoute Groups機能です。URLパスには影響せず、レイアウトをグループ化するために使用されます。

### Server Components vs Client Components
デフォルトではすべてのコンポーネントがServer Component（サーバーサイドでレンダリング）です。`'use client'`ディレクティブがあるコンポーネント（`SearchBox`など）のみがClient Component（クライアントサイドでレンダリング）になります。

### 型安全性
Prismaの型定義とカスタム型定義（`types/post.ts`）を組み合わせることで、データベースからフロントエンドまで一貫した型安全性を実現しています。

