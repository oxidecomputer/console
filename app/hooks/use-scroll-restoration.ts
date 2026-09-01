/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useRef } from 'react'
import { useLocation, useNavigation } from 'react-router'

import { usePagePath } from './use-crumbs'

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
  // page path looks at the page under a side modal, which we use to distinguish
  // modal open/close (which shouldn't reset scroll) from full page navs (which
  // should)
  const page = usePagePath()
  // last committed location, tracked at idle. We can't track it during
  // 'loading' because a nav with cached loader data can complete without ever
  // hitting state === 'loading'.
  const prev = useRef<{ key: string; page: string } | null>(null)
  useEffect(() => {
    // opt out of native scroll restoration, it conflicts with ours
    window.history.scrollRestoration = 'manual'

    // idle + new key = we just landed somewhere (or this is the initial render)
    const landed = state === 'idle' && prev.current?.key !== key

    // underlying page didn't change, which either means the nav was opening
    // or closing a side modal, a query param tab change, or clicking the
    // breadcrumb for the page you're already on
    const samePage = prev.current?.page === page

    if (state === 'loading') {
      // nav in flight: save current scroll under the outgoing location's key
      setScrollPosition(key, window.scrollY)
    } else if (landed) {
      if (samePage) {
        // leave scroll alone, record under the new key so it can be restored
        // on forward/back
        setScrollPosition(key, window.scrollY)
      } else {
        // landed on a new page: restore its saved scroll, or 0 if none saved
        window.scrollTo(0, getScrollPosition(key))
      }
    }
    if (state === 'idle') prev.current = { key, page }
  }, [key, state, page])
}
