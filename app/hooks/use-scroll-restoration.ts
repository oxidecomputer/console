import { useEffect, useRef } from 'react'
import { useLocation, useNavigation } from 'react-router-dom'

/**
 * Given a ref to a scrolling container element, keep track of its scroll
 * position before navigation and restore it on return (e.g., back/forward nav).
 * Note that `location.key` is used as the cache key, not `location.pathname`,
 * so the same path navigated to at different points in the history stack will
 * not share the same scroll position.
 */
export function useScrollRestoration(container: React.RefObject<HTMLElement>) {
  const cache = useRef(new Map<string, number>())
  const { key } = useLocation()
  const { state } = useNavigation()
  useEffect(() => {
    if (state === 'loading') {
      cache.current.set(key, container.current?.scrollTop ?? 0)
    } else if (state === 'idle' && cache.current.has(key)) {
      container.current?.scrollTo(0, cache.current.get(key)!)
    }
  }, [key, state, container])
}
