import { prisma } from "@/lib/prisma"
import type { Post } from "@/types/post"

export async function getPosts(): Promise<Post[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return posts as Post[]
  } catch (error) {
    console.error('Error in getPosts:', error)
    throw error
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { name: true } } }
    })
    return post as Post | null
  } catch (error) {
    console.error('Error in getPost:', error)
    throw error
  }
}

export async function searchPosts(search: string): Promise<Post[]> {
  try {
    // URLデコードと正規化
    let decodedSearch = search
    try {
      decodedSearch = decodeURIComponent(search)
    } catch {
      // デコードに失敗した場合は元の文字列を使用
      decodedSearch = search
    }
    
    // 全角スペースを半角スペースに変換
    const normalizedSearch = decodedSearch.replace(/[\u3000\s]+/g, ' ').trim()
    
    if (!normalizedSearch) {
      return []
    }
    
    // スペースで分割して検索ワードを取得
    const searchWords = normalizedSearch.split(' ').filter(Boolean)
    
    if (searchWords.length === 0) {
      return []
    }
    
    // すべての投稿を取得（大文字小文字を区別しない検索のため）
    const allPosts = await prisma.post.findMany({
      where: { published: true },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    
    // 検索ワードを正規化（全角数字・英字を半角に変換、小文字に変換）
    const normalizeText = (text: string): string => {
      return text
        .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
        .replace(/[Ａ-Ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
        .replace(/[ａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
        .toLowerCase()
        .trim()
    }
    
    const normalizedSearchWords = searchWords.map(w => normalizeText(w)).filter(Boolean)
    
    if (normalizedSearchWords.length === 0) {
      return []
    }
    
    // 各投稿が検索条件に一致するかチェック
    const filteredPosts = allPosts.filter(post => {
      const normalizedTitle = normalizeText(post.title)
      const normalizedContent = normalizeText(post.content)
      const normalizedText = `${normalizedTitle} ${normalizedContent}`
      
      // すべての検索ワードがタイトルまたはコンテンツに含まれるかチェック
      const matches = normalizedSearchWords.every(word => 
        normalizedText.includes(word)
      )
      
      return matches
    })
    
    return filteredPosts as Post[]
  } catch (error) {
    console.error('Error in searchPosts:', error)
    throw error
  }
}