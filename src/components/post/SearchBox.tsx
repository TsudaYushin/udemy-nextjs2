'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'

export default function SearchBox() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const isInitialMount = useRef(true)

  // URLパラメータから初期値を取得
  useEffect(() => {
    const query = searchParams.get('search') || ''
    if (isInitialMount.current) {
      setSearch(query)
      setDebouncedSearch(query)
      isInitialMount.current = false
    }
  }, [searchParams])

  // デバウンス (高頻度に呼び出されるのを防ぐ 500ms後に実行)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // debouncedSearchが変更されたときにルーティング（初期化時は除外）
  useEffect(() => {
    if (isInitialMount.current) return

    const currentQuery = searchParams.get('search') || ''
    const newQuery = debouncedSearch.trim()

    // URLパラメータと異なる場合のみルーティング
    if (currentQuery !== newQuery) {
      // 現在のパスに応じて適切なページにリダイレクト
      const basePath = pathname === '/posts' ? '/posts' : '/'
      if (newQuery) {
        router.push(`${basePath}?search=${encodeURIComponent(newQuery)}`)
      } else {
        router.push(basePath)
      }
    }
  }, [debouncedSearch, router, searchParams, pathname])

  return (
    <Input
      placeholder="記事を検索.."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full min-w-[120px] sm:min-w-[200px] lg:min-w-[300px]"
    />
  )
}