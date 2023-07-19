/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import throttle from 'lodash.throttle'
import type { MutableRefObject } from 'react'
import { useLayoutEffect, useState } from 'react'

export const useIsOverflow = (
  ref: MutableRefObject<HTMLDivElement | null>,
  dir: 'horizontal' | 'vertical',
  callback?: (hasOverflow: boolean) => void
) => {
  const [isOverflow, setIsOverflow] = useState<boolean | undefined>()
  const [scrollStart, setScrollStart] = useState<boolean>(true)
  const [scrollEnd, setScrollEnd] = useState<boolean>(false)

  useLayoutEffect(() => {
    if (!ref?.current) return

    const trigger = () => {
      if (!ref?.current) return

      const el = ref.current
      const hasOverflow =
        dir === 'vertical'
          ? el.scrollHeight > el.clientHeight
          : el.scrollWidth > el.clientWidth
      setIsOverflow(hasOverflow)

      if (callback) callback(hasOverflow)
    }

    const handleScroll = throttle(
      () => {
        if (!ref?.current) return

        const el = ref.current
        const [scrollAmount, overflowAmount] =
          dir === 'vertical'
            ? [el.scrollTop, el.scrollHeight - el.clientHeight]
            : [el.scrollLeft, el.scrollWidth - el.clientWidth]

        setScrollStart(scrollAmount === 0)
        setScrollEnd(scrollAmount >= overflowAmount && scrollEnd === false)
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
  }, [callback, ref, scrollStart, scrollEnd, dir])

  return {
    isOverflow,
    scrollStart,
    scrollEnd,
  }
}
