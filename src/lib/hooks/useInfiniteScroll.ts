import { useEffect, useCallback } from 'react'

interface UseInfiniteScrollProps {
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  threshold?: number
}

export const useInfiniteScroll = ({
  loading,
  hasMore,
  onLoadMore,
  threshold = 100
}: UseInfiniteScrollProps) => {
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      onLoadMore()
    }
  }, [loading, hasMore, onLoadMore, threshold])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { handleScroll }
}
