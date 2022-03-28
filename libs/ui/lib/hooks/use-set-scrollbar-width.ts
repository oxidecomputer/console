import useGetScrollbarWidth from '@utilityjs/use-get-scrollbar-width'
import type { RefObject } from 'react'
import { useLayoutEffect, useState } from 'react'
import { debounce } from 'debounce'

export const useSetScrollbarWidth = () => {
  const getScrollbarWidth = useGetScrollbarWidth()
  useLayoutEffect(() => {
    document
      .querySelector(':root')
      // @ts-expect-error style is there, trust me
      ?.style.setProperty('--scrollbar-width', getScrollbarWidth())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export const useHasScrollbar = <C>(ref: RefObject<C>) => {
  const [hasScrollbar, setHasScrollbar] = useState(false)
  useLayoutEffect(() => {
    const handleResize = debounce(() => {
      if (!ref.current) return
      // @ts-expect-error TODO figure out the proper types for `C` to make this work
      const { scrollHeight, offsetHeight } = ref.current
      setHasScrollbar(scrollHeight > offsetHeight)
    }, 100)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [ref, setHasScrollbar])
  return hasScrollbar
}

/** Helper component to fire the hook */
export const ScrollbarWidth = () => {
  useSetScrollbarWidth()
  return null
}
