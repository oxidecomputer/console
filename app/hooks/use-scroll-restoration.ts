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
  // The page on screen at this location: a side modal route renders its parent
  // page underneath, so it counts as that page. Navigating within the same
  // page (opening or closing a side modal over it) shouldn't move the scroll.
  const page = usePagePath()
  // last committed location, tracked at idle. We can't track this in the
  // loading state because a navigation whose loader data is already cached
  // can complete without ever rendering with state === 'loading'.
  const prev = useRef<{ key: string; page: string } | null>(null)
  useEffect(() => {
    // opt out of the browser's native scroll restoration so it doesn't jump
    // the still-visible old page to the new page's saved position on POP,
    // before the new route's loader resolves. We restore manually below.
    window.history.scrollRestoration = 'manual'
    if (state === 'loading') {
      // during a navigation, location still reflects the old route
      setScrollPosition(key, window.scrollY)
    } else if (state === 'idle' && prev.current?.key !== key) {
      // both checks are needed: key changes on every nav, including same-page
      // ones like opening a side modal, so key says we just landed on a new
      // location (or this is the initial render) and page decides whether the
      // nav stayed within the same page
      if (prev.current?.page === page) {
        // same page, new location (opened a side modal): leave the scroll alone
        // and record it under the new location's key so back/forward to it
        // restores correctly
        setScrollPosition(key, window.scrollY)
      } else {
        window.scrollTo(0, getScrollPosition(key))
      }
    }
    if (state === 'idle') prev.current = { key, page }
  }, [key, state, page])
}
