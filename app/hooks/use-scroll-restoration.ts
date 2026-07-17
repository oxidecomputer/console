/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import { useLocation, useNavigation } from 'react-router'

function getScrollPosition(key: string) {
  const pos = window.sessionStorage.getItem(key)
  return Number(pos) || 0
}

function setScrollPosition(key: string, pos: number) {
  window.sessionStorage.setItem(key, pos.toString())
}

/**
 * Keep track of window scroll position before navigation and restore it on
 * return (e.g., back/forward nav). Note that `location.key` is used in the
 * cache key, not `location.pathname`, so the same path navigated to at
 * different points in the history stack will not share the same scroll position.
 *
 * We tried RR's built-in `<ScrollRestoration />` and it didn't work — on
 * back/forward nav, `window.scrollTo` was called with the right value but the
 * document was still at viewport height at that moment, so the scroll got
 * clamped to 0. We're not sure why; a theory is that RR restores in a
 * `useLayoutEffect` which fires before some later render expands the content,
 * and our `useEffect` after paint happens to catch that later render.
 */
export function useScrollRestoration() {
  const key = `scroll-position-${useLocation().key}`
  const { state } = useNavigation()
  useEffect(() => {
    // opt out of the browser's native scroll restoration so it doesn't jump
    // the still-visible old page to the new page's saved position on POP,
    // before the new route's loader resolves. We restore manually below.
    window.history.scrollRestoration = 'manual'
    if (state === 'loading') {
      setScrollPosition(key, window.scrollY)
    } else if (state === 'idle') {
      window.scrollTo(0, getScrollPosition(key))
    }
  }, [key, state])
}
