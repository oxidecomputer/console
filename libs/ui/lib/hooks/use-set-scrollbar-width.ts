import useGetScrollbarWidth from '@utilityjs/use-get-scrollbar-width'
import type { RefObject } from 'react'
import { useLayoutEffect, useState } from 'react'
import { debounce } from 'debounce'

/**
 * Hook to set the `--scrollbar-width` css variable. It's intended
 * to be used once globally, likely in your main or app component.
 *
 * {@see ScrollbarWidth} for a shorthand for using this hook directly in JSX
 */
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

/**
 * Returns `true` if the provided ref has a scrollbar. It will
 * re-check when the window is resized. It _won't_ re-check if
 * the container size changes due to another element growing or
 * shrinking in size around it though.
 */
export const useHasScrollbar = <C>(ref: RefObject<C>) => {
  const [hasScrollbar, setHasScrollbar] = useState(false)
  useLayoutEffect(() => {
    const handleResize = debounce(() => {
      if (!ref.current) return
      // @ts-expect-error TODO figure out the proper types for `C` to make this work
      const { scrollHeight, offsetHeight } = ref.current
      setHasScrollbar(scrollHeight > offsetHeight)
    }, 100)

    // Go ahead and set the initial value
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [ref, setHasScrollbar])
  return hasScrollbar
}

/**
 * Helper component that calls {@link useSetScrollbarWidth} and returns null.
 */
export const ScrollbarWidth = () => {
  useSetScrollbarWidth()
  return null
}
