import type { Blocker, History, Transition } from 'history'
import type { ContextType } from 'react'
import { useCallback, useContext, useEffect } from 'react'
import type { Navigator as BaseNavigator } from 'react-router-dom'
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom'

interface Navigator extends BaseNavigator {
  block: History['block']
}

type NavigationContextWithBlock = ContextType<typeof NavigationContext> & {
  navigator: Navigator
}
/**
 * @source https://github.com/remix-run/react-router/commit/256cad70d3fd4500b1abcfea66f3ee622fb90874
 */
export function useBlocker(blocker: Blocker, when = true) {
  const { navigator } = useContext(NavigationContext) as NavigationContextWithBlock

  useEffect(() => {
    if (!when) {
      return
    }

    const unblock = navigator.block((tx: Transition) => {
      const autoUnblockingTx = {
        ...tx,
        retry() {
          // Automatically unblock the transition so it can play all the way
          // through before retrying it. TODO: Figure out how to re-enable
          // this block if the transition is cancelled for some reason.
          unblock()
          tx.retry()
        },
      }

      blocker(autoUnblockingTx)
    })

    return unblock
  }, [navigator, blocker, when])
}

/**
 * @source https://github.com/remix-run/react-router/issues/8139#issuecomment-1021457943
 */
export function usePrompt(
  message:
    | string
    | ((location: Transition['location'], action: Transition['action']) => string),
  when = true
) {
  const blocker = useCallback(
    (tx: Transition) => {
      let response
      if (typeof message === 'function') {
        response = message(tx.location, tx.action)
        if (typeof response === 'string') {
          response = window.confirm(response)
        }
      } else {
        response = window.confirm(message)
      }
      if (response) {
        tx.retry()
      }
    },
    [message]
  )
  return useBlocker(blocker, when)
}
