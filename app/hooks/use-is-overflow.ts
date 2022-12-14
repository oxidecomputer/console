import throttle from 'lodash.throttle'
import type { MutableRefObject } from 'react'
import { useLayoutEffect, useState } from 'react'

export const useIsOverflow = (
  ref: MutableRefObject<HTMLDivElement | null>,
  callback?: (hasOverflow: boolean) => void
) => {
  const [isOverflow, setIsOverflow] = useState<boolean | undefined>()
  const [scrollStart, setScrollStart] = useState<boolean>(true)
  const [scrollEnd, setScrollEnd] = useState<boolean>(false)

  useLayoutEffect(() => {
    if (!ref?.current) return

    const trigger = () => {
      if (!ref?.current) return
      const { current } = ref

      const hasOverflow = current.scrollWidth > current.clientWidth
      setIsOverflow(hasOverflow)

      if (callback) callback(hasOverflow)
    }

    const handleScroll = throttle(
      () => {
        if (!ref?.current) return
        const { current } = ref

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
      },
      125,
      { leading: true, trailing: true }
    )

    trigger()

    const { current } = ref
    current.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      current.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [callback, ref, scrollStart, scrollEnd])

  return {
    isOverflow,
    scrollStart,
    scrollEnd,
  }
}
