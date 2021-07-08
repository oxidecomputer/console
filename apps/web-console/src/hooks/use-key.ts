import { useEffect } from 'react'
import Mousetrap from 'mousetrap'

type Key = Parameters<typeof Mousetrap.bind>[0]
type Callback = Parameters<typeof Mousetrap.bind>[1]

export const useKey = (key: Key, fn: Callback) => {
  useEffect(() => {
    Mousetrap.bind(key, fn)
    return () => {
      Mousetrap.unbind(key)
    }
  }, [key, fn])
}
