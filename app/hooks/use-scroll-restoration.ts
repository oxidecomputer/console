import { useEffect, useRef } from 'react'
import { useLocation, useNavigation } from 'react-router-dom'

export function useScrollRestoration(elementRef: React.RefObject<HTMLElement>) {
  const cache = useRef(new Map<string, number>())
  const { key } = useLocation()
  const { state } = useNavigation()
  useEffect(() => {
    if (state === 'loading') {
      cache.current.set(key, elementRef.current?.scrollTop ?? 0)
    } else if (state === 'idle' && cache.current.has(key)) {
      elementRef.current?.scrollTo(0, cache.current.get(key)!)
    }
  }, [key, state, elementRef])
}
