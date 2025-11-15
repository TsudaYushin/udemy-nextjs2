# Supabaseストレージ設定ガイド

## 画像が表示できない場合の対処法

### 1. バケットの公開設定を確認

1. Supabaseダッシュボードにログイン
2. 左メニューから「Storage」を選択
3. バケット名（例：`Udemy-next-blog`）をクリック
4. 「Settings」タブを開く
5. 「Public bucket」が有効になっているか確認
   - 無効の場合は有効にする

### 2. ストレージポリシー（RLS）の設定

バケットが公開設定になっていても、RLSポリシーが設定されていないと画像にアクセスできません。

#### 方法1: Supabaseダッシュボードから設定

1. Supabaseダッシュボード → 「Storage」→ 「Policies」
2. バケット名を選択
3. 「New Policy」をクリック
4. 「For full customization」を選択
5. 以下のSQLを入力：

```sql
-- 読み取りポリシー（全員が読み取り可能）
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'Udemy-next-blog');
```

**重要**: `'Udemy-next-blog'`の部分を実際のバケット名に置き換えてください。

#### 方法2: SQL Editorから設定

1. Supabaseダッシュボード → 「SQL Editor」
2. 「New query」をクリック
3. 以下のSQLを実行：

```sql
-- バケット名を実際の名前に置き換えてください
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'Udemy-next-blog');
```

### 3. バケット名の確認

環境変数でバケット名を設定する場合：

`.env.local`ファイルに以下を追加：

```bash
NEXT_PUBLIC_SUPABASE_BUCKET_NAME=Udemy-next-blog
```

**注意**: バケット名の大文字小文字は重要です。URLに表示されているバケット名と完全に一致させる必要があります。

### 4. 確認方法

1. ブラウザの開発者ツール（F12）を開く
2. 「Network」タブを選択
3. ページを再読み込み
4. 画像リクエストを確認：
   - **200 OK**: 正常に読み込まれている
   - **403 Forbidden**: ポリシーが設定されていない、またはバケットが公開設定になっていない
   - **404 Not Found**: ファイルが存在しない、またはバケット名が間違っている

### 5. トラブルシューティング

#### 403エラーが表示される場合
- バケットの「Public bucket」設定を確認
- ストレージポリシーが正しく設定されているか確認
- バケット名が正しいか確認

#### 404エラーが表示される場合
- ファイルが実際にSupabaseにアップロードされているか確認
- バケット名がURLと一致しているか確認
- 環境変数`NEXT_PUBLIC_SUPABASE_BUCKET_NAME`が正しく設定されているか確認

