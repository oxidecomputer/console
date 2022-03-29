import { useCallback } from 'react'

/**
 * A mechanism for connecting two callbacks to one another.
 * For example, you may have an `onClick` handler on one component that you want
 * to connect to an `addItem` handler of another component.
 */
export const useCallbackEffect = <Args>() => {
  const effect = useCallback((...args: Args[]) => args, [])
  const callback = useCallback(
    (...args: Args[]) => {
      effect(...args)
    },
    [effect]
  )

  return [callback, effect] as const
}
