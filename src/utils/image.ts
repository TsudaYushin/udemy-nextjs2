import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { supabase } from '@/lib/supabase';

// 許可する画像ファイルのMIMEタイプ
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// 最大ファイルサイズ（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 環境によってローカル保存とsupabase保存を切り替えるようにする
export async function saveImage(file: File): Promise<string | null> {
  const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE_STORAGE === 'true';

  if (useSupabase) {
    return await saveImageToSupabase(file);
  } else {
    return await saveImageToLocal(file);
  }
}

async function saveImageToSupabase(file: File): Promise<string | null> {
  // バケット名を環境変数から取得（デフォルトは'Udemy-next-blog' - 大文字のU）
  // 注意: バケット名の大文字小文字は重要です
  const preferredBucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'Udemy-next-blog';

  // ファイルサイズの検証
  if (file.size === 0) {
    throw new Error('ファイルサイズが0です');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / 1024 / 1024}MBまでです`);
  }

  // ファイルタイプの検証
  if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`許可されていないファイルタイプです: ${file.type || '不明'}`);
  }

  const fileName = `${Date.now()}_${file.name}`;
  
  // バケットの存在確認と実際のバケット名の取得
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Bucket list error:', listError.message);
    throw new Error(`Supabaseストレージへの接続に失敗しました: ${listError.message}`);
  }

  // バケット名を大文字小文字を区別せずに検索
  const bucket = buckets?.find(b => 
    b.name.toLowerCase() === preferredBucketName.toLowerCase()
  );
  
  if (!bucket) {
    const availableBuckets = buckets?.map(b => b.name).join(', ') || 'なし';
    throw new Error(
      `ストレージバケット「${preferredBucketName}」が見つかりません。` +
      `利用可能なバケット: ${availableBuckets}` +
      `環境変数NEXT_PUBLIC_SUPABASE_BUCKET_NAMEに正しいバケット名を設定してください。`
    );
  }

  // 実際のバケット名を使用（大文字小文字を正確に）
  const bucketName = bucket.name;
  
  // デバッグ用（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('Using bucket name:', bucketName);
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error.message);
    throw new Error(`Supabaseへのアップロードに失敗しました: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  if (!publicUrlData?.publicUrl) {
    throw new Error('画像のURL取得に失敗しました');
  }

  // デバッグ用（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('Generated image URL:', publicUrlData.publicUrl);
  }

  return publicUrlData.publicUrl;
}

async function saveImageToLocal(file: File): Promise<string | null> {
  // ファイルサイズの検証
  if (file.size === 0) {
    throw new Error('ファイルサイズが0です');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / 1024 / 1024}MBまでです`);
  }

  // ファイルタイプの検証
  if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`許可されていないファイルタイプです: ${file.type || '不明'}`);
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch (error) {
    throw new Error(`ファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
  
  // ファイル名を生成（タイムスタンプ + 元のファイル名）
  const timestamp = Date.now();
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') || 'image';
  const fileName = `${timestamp}_${originalName}`;
  
  // アップロードフォルダ
  const uploadDir = path.join(process.cwd(), 'public', 'images');
  
  // ディレクトリが存在するか確認し、なければ作成
  try {
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // ディレクトリが実際にディレクトリであることを確認
    const stats = await stat(uploadDir);
    if (!stats.isDirectory()) {
      throw new Error('imagesはディレクトリである必要があります');
    }
  } catch (dirError) {
    throw new Error(`ディレクトリの作成に失敗しました: ${dirError instanceof Error ? dirError.message : '不明なエラー'}`);
  }
  
  // 保存先の完全なファイル名
  const filePath = path.join(uploadDir, fileName);
  
  // 指定パスにファイル(buffer)を書き込む
  try {
    await writeFile(filePath, buffer);
  } catch (writeError) {
    throw new Error(`ファイルの書き込みに失敗しました: ${writeError instanceof Error ? writeError.message : '不明なエラー'}`);
  }
  
  // URLパスを返す
  return `/images/${fileName}`;
}