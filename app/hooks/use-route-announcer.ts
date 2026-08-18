/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { announce } from '@react-aria/live-announcer'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

import { useCrumbs, useIsSideModalRoute } from './use-crumbs'

/**
 * A real page load tells a screen reader where it landed: the new page gets
 * announced and the reading position goes back to the top. A client-side nav
 * does neither — React Router swaps the DOM in place and focus stays on the
 * link that was clicked, which often doesn't exist anymore. Next.js ships a
 * route announcer for this; React Router leaves it to the app.
 *
 * So on every page change we do it ourselves: announce the new page in a live
 * region, and if the click left focus stranded on the body, move it to the top
 * of the content, which is where the skip link points too.
 */
export function useRouteAnnouncer() {
  const { pathname } = useLocation()
  const crumbs = useCrumbs()

  // deepest crumb first, like the document title, so the specific page comes
  // before its containers: "Instances, mock-project, Projects"
  const pageName = crumbs
    .map((c) => c.label)
    .reverse()
    .join(', ')

  const isSideModal = useIsSideModalRoute()

  // initialized with the current path so we don't announce the page we loaded
  // on — the browser already did that
  const lastAnnounced = useRef(pathname)

  useEffect(() => {
    // A side modal is open, so we're still on the page underneath and there's
    // nothing to announce. The dialog announces its own title and manages its
    // own focus, so stay out of its way. Leaving the ref alone also makes
    // dismissing it — a nav back to that same page — a no-op.
    if (isSideModal) return

    if (pathname === lastAnnounced.current) return
    lastAnnounced.current = pathname

    // polite rather than assertive so we don't cut off a toast announcing the
    // result of the action that navigated us here
    announce(pageName || 'Oxide Console', 'polite')

    // Only take focus when it has fallen to the body, which is what happens
    // when whatever had it (usually the link that was clicked) is gone from the
    // new page. If focus is still on something real — a sidebar or breadcrumb
    // link, an input the new page focused itself — leave it alone.
    //
    // preventScroll because scroll position is useScrollRestoration's job:
    // without it, focusing the top of the page would clobber the restored
    // position on back/forward nav.
    if (document.activeElement === document.body) {
      document.getElementById('content')?.focus({ preventScroll: true })
    }
  }, [pathname, pageName, isSideModal])
}
