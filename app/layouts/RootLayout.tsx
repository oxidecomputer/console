import { useEffect, useRef } from 'react'
import { Outlet, useNavigation } from 'react-router-dom'

import { ToastStack } from 'app/components/ToastStack'
import { useCrumbs } from 'app/hooks/use-crumbs'

function useSetTitle() {
  const crumbs = useCrumbs()
  // output
  // non top-level route: Instances / mock-project / Projects / maze-war / Oxide Console
  // top-level route: Oxide Console
  const title = crumbs
    .slice() // avoid mutating original with reverse()
    .reverse()
    .map((item) => item.label)
    .concat('Oxide Console') // if there are no crumbs, we're still Oxide Console
    .join(' / ')

  useEffect(() => {
    document.title = title
  }, [title])
}

/**
 * Root layout that applies to the entire app. Modify sparingly. It's rare for
 * anything to actually belong here.
 */
export default function RootLayout() {
  useSetTitle()

  return (
    <>
      <LoadingBar />
      <Outlet />
      <ToastStack />
    </>
  )
}

const LOADING_BAR_DELAY_MS = 20

/**
 * Loading bar for top-level navigations. When a nav first starts, the bar zooms
 * from 0 to A quickly and then more slowly grows from A to B. The idea is that
 * the actual fetching should almost always complete while the bar is between A
 * and B. The animation from 0 to A to B is represented by the `loading` label.
 * Then once we're done fetching, we switch to the `done` animation from B to
 * 100.
 *
 * **Important:** we only do any of this if the navigation takes longer than
 * `LOADING_BAR_DELAY_MS`. This prevents us from showing the loading bar on navs
 * that are instantaneous, like opening a create form. Sometimes normal page
 * navs are also instantaneous due to caching.
 *
 * ```
 *   ├──────────┼──────────┼──────────┤
 *   0          A          B         100
 *
 *   └─────────┰──────────┘ └────┰────┘
 *           loading            done
 * ```
 */
function LoadingBar() {
  const navigation = useNavigation()

  // use a ref because there's no need to bring React state into this
  const barRef = useRef<HTMLDivElement>(null)

  // only used for checking the loading state from inside the timeout callback
  const loadingRef = useRef(false)
  loadingRef.current = navigation.state === 'loading'

  useEffect(() => {
    const loading = navigation.state === 'loading'
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
            barRef.current?.scrollTop

            // Kick off the animation
            barRef.current?.classList.add('loading')
          }
        }, LOADING_BAR_DELAY_MS)

        // Clean up the timeout if we get another render in the meantime. This
        // doesn't seem to affect behavior but it's the Correct thing to do.
        return () => clearTimeout(timeout)
      } else if (barRef.current.classList.contains('loading')) {
        // Needs the if condition because if loading is false and we *don't*
        // have the `loading` animation running, we're on initial pageload and
        // we don't want to run the done animation. This is also necessary for
        // the case where we want to skip the animation entirely because the
        // loaders finished very quickly: when we get here, the callback that
        // sets the loading class will not have run yet, so we will not apply
        // the done class, which is correct because we don't want to run the
        // `done` animation if the `loading` animation hasn't happened.

        barRef.current.classList.replace('loading', 'done')

        // We don't need to remove `done` when it's over done because the final
        // state has opacity 0, and whenever a new animation starts, we remove
        // `done` to start fresh.
      }
    }
    // It is essential that we have `navigation` here as a dep rather than
    // calculating `loading` outside and using that as the dep. If we do the
    // latter, this effect does not run when a new nav happens while we're
    // already loading, because the value of `loading` does not change in that
    // case. The value of `navigation` does change on each new nav.
  }, [navigation])

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <div ref={barRef} className="global-loading-bar h-px bg-accent" />
    </div>
  )
}
