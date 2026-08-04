/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useRef, useSyncExternalStore } from 'react'
import type { createBrowserRouter } from 'react-router'

type AppRouter = ReturnType<typeof createBrowserRouter>

const LOADING_BAR_DELAY_MS = 20

/**
 * Loading bar for initial pageload and top-level navigations. When a load
 * first starts, the bar zooms from 0 to A quickly and then more slowly grows
 * from A to B. The idea is that the actual fetching should almost always
 * complete while the bar is between A and B. The animation from 0 to A to B is
 * represented by the `loading` label. Then once we're done fetching, we switch
 * to the `done` animation from B to 100.
 *
 * **Important:** we only do any of this if the load takes longer than
 * `LOADING_BAR_DELAY_MS`. This prevents us from showing the loading bar on
 * navs that are instantaneous, like opening a create form. Sometimes normal
 * page navs are also instantaneous due to caching.
 *
 * ```
 *   ├──────────┼──────────┼──────────┤
 *   0          A          B         100
 *
 *   └─────────┰──────────┘ └────┰────┘
 *           loading            done
 * ```
 *
 * This component lives *outside* `RouterProvider` (which is why it subscribes
 * to the router directly rather than using `useNavigation`) so that it stays
 * mounted when initial hydration completes and the `HydrateFallback` is
 * swapped out for the real route tree. If it were inside the router, it would
 * unmount at that moment and the `done` animation would be cut off.
 */
export function LoadingBar({ router }: { router: AppRouter }) {
  // subscribe twice to the same store rather than deriving a single boolean
  // because we need `navigation` object identity in the effect deps (see
  // comment below)
  const navigation = useSyncExternalStore(router.subscribe, () => router.state.navigation)
  const initialized = useSyncExternalStore(router.subscribe, () => router.state.initialized)

  // `!initialized` covers initial pageload: the router starts fetching
  // immediately on creation, and `initialized` flips to true when the first
  // load (lazy route modules plus loaders) is done
  const loading = !initialized || navigation.state === 'loading'

  // use a ref because there's no need to bring React state into this
  const barRef = useRef<HTMLDivElement>(null)

  // only used for checking the loading state from inside the timeout callback
  const loadingRef = useRef(false)
  loadingRef.current = loading

  // whether the router has ever been fully idle since pageload. Used to
  // distinguish the initial load from subsequent user navs: a loader redirect
  // during initial load (like / -> /projects) is a new navigation, but the
  // user experiences it as part of one continuous pageload, so we don't
  // restart the animation for it
  const everIdleRef = useRef(false)
  if (!loading) everIdleRef.current = true

  useEffect(() => {
    if (barRef.current) {
      if (loading) {
        // instead of adding the `loading` class right when loading starts, set
        // a LOADING_BAR_DELAY_MS timeout that starts the animation, but ONLY if
        // we are still loading when the callback runs. If the loaders in a
        // particular nav finish immediately, the value of `loadingRef.current`
        // will be back to `false` by the time the callback runs, skipping the
        // animation sequence entirely.
        const timeout = setTimeout(() => {
          if (loadingRef.current) {
            // During initial load, let an already-running animation continue
            // rather than restarting it, so the redirect reads as one load
            if (!everIdleRef.current && barRef.current?.classList.contains('loading')) {
              return
            }

            // Remove class and force reflow. Without this, the animation does
            // not restart from the beginning if we nav again while already
            // loading. https://gist.github.com/paulirish/5d52fb081b3570c81e3a
            //
            // It's important that this happen inside the timeout and inside the
            // condition for the case where we're doing an instant nav while a
            // nav animation is already running. If we did this outside the
            // timeout callback or even inside the callback but outside the
            // condition, we'd immediately kill an in-progress loading animation
            // that was about to finish on its own anyway.
            barRef.current?.classList.remove('loading', 'done')
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            barRef.current?.scrollTop

            // Kick off the animation
            barRef.current?.classList.add('loading')
          }
        }, LOADING_BAR_DELAY_MS)

        // Clean up the timeout if we get another render in the meantime. This
        // doesn't seem to affect behavior but it's the Correct thing to do.
        return () => clearTimeout(timeout)
      } else if (barRef.current.classList.contains('loading')) {
        // Needs the if condition for the case where we want to skip the
        // animation entirely because the loaders finished very quickly: when
        // we get here, the callback that sets the loading class will not have
        // run yet, so we will not apply the done class, which is correct
        // because we don't want to run the `done` animation if the `loading`
        // animation hasn't happened.

        barRef.current.classList.replace('loading', 'done')

        // We don't need to remove `done` when it's over done because the final
        // state has opacity 0, and whenever a new animation starts, we remove
        // `done` to start fresh.
      }
    }
    // It is essential that we have `navigation` here as a dep rather than only
    // `loading`. If we only had the latter, this effect would not run when a
    // new nav happens while we're already loading, because the value of
    // `loading` does not change in that case. The value of `navigation` does
    // change on each new nav.
  }, [navigation, initialized, loading])

  return (
    <div className="fixed top-0 right-0 left-0 z-50">
      <div ref={barRef} className="global-loading-bar bg-accent-inverse h-px" />
    </div>
  )
}
