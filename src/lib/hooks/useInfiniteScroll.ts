import { useEffect, useCallback } from 'react'

interface UseInfiniteScrollProps {
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  threshold?: number
}

// El shell autenticado (ConditionalLayout.tsx) nunca scrollea window/document: <main>
// es h-screen overflow-hidden y el único contenedor con scroll real es el
// <section id="app-scroll-container"> de altura fija que envuelve el contenido de la
// página. Por eso el listener se ata ahí (con fallback a window para rutas sin shell,
// p. ej. /login).
const getScrollContainer = (): HTMLElement | Window =>
  document.getElementById('app-scroll-container') || window

const getScrollMetrics = (container: HTMLElement | Window) => {
  if (container instanceof HTMLElement) {
    return { scrollTop: container.scrollTop, scrollHeight: container.scrollHeight, clientHeight: container.clientHeight }
  }
  return document.documentElement
}

export const useInfiniteScroll = ({
  loading,
  hasMore,
  onLoadMore,
  threshold = 100
}: UseInfiniteScrollProps) => {
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = getScrollMetrics(getScrollContainer())

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      onLoadMore()
    }
  }, [loading, hasMore, onLoadMore, threshold])

  useEffect(() => {
    const container = getScrollContainer() as EventTarget
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Si la primera página no llena el contenedor no hay scroll que disparar el listener
  // de arriba, así que se comprueba una vez apenas cambian loading/hasMore (p. ej. al
  // terminar de cargar) para no dejar `hasMore` colgado sin cargar la siguiente página.
  useEffect(() => {
    handleScroll()
  }, [handleScroll])

  return { handleScroll }
}
