import type { MutableRefObject } from 'react'
import { useLayoutEffect, useState } from 'react'

export const useIsOverflow = (
  ref: MutableRefObject<HTMLDivElement | null>,
  callback?: (hasOverflow: boolean) => void
) => {
  const [isOverflow, setIsOverflow] = useState<boolean | undefined>()
  const [scrollStart, setScrollStart] = useState<boolean>(true)
  const [scrollEnd, setScrollEnd] = useState<boolean>(false)

  const size = useWindowSize()

  useLayoutEffect(() => {
    if (!ref || !ref.current) {
      return
    }
    const { current } = ref

    const trigger = () => {
      const hasOverflow = current.scrollWidth > current.clientWidth
      setIsOverflow(hasOverflow)

      if (callback) callback(hasOverflow)
    }

    const handleScroll = () => {
      if (current.scrollLeft === 0) {
        setScrollStart(true)
      } else {
        setScrollStart(false)
      }

      const offsetRight = current.scrollWidth - current.clientWidth
      if (current.scrollLeft >= offsetRight && scrollEnd === false) {
        setScrollEnd(true)
      } else {
        setScrollEnd(false)
      }
    }

    trigger()

    current.addEventListener('scroll', handleScroll)
    return () => current.removeEventListener('scroll', handleScroll)
  }, [callback, ref, size, scrollStart, scrollEnd])

  return {
    isOverflow,
    scrollStart,
    scrollEnd,
  }
}

function useWindowSize() {
  const [size, setSize] = useState<{
    width: number
    height: number
  }>({
    width: 0,
    height: 0,
  })

  useLayoutEffect(() => {
    // Only execute all the code below in client side
    if (typeof window !== 'undefined') {
      // Handler to call on window resize
      const handleResize = () => {
        // Set window width/height to state
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener('resize', handleResize)

      handleResize()

      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    size,
  }
}

export default useWindowSize
