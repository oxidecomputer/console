import useGetScrollbarWidth from '@utilityjs/use-get-scrollbar-width'
import { useLayoutEffect } from 'react'

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

/** Helper component to fire the hook */
export const ScrollbarWidth = () => {
  useSetScrollbarWidth()
  return null
}
