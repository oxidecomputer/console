import { useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom'

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
      <ScrollRestoration />
    </>
  )
}

/**
 * Loading bar for top-level navigations. When a nav first starts, the bar zooms
 * from 0 to A quickly and then more slowly grows from A to B. The idea is that
 * the actual fetching should almost always complete while the bar is between A
 * and B. The animation from 0 to A to B is represented by the `loading` label.
 * Then once we're done fetching, we switch to the `done` animation from B to
 * 100.
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

  // done with a ref because there's no need to bring React state into this
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loading = navigation.state === 'loading'
    const el = ref.current
    if (el) {
      if (loading) {
        // Remove class and force reflow. Without this, the animation does not
        // restart from the beginning if we nav again while already loading.
        // https://gist.github.com/paulirish/5d52fb081b3570c81e3a
        el.classList.remove('loading', 'done')
        el.scrollTop

        el.classList.add('loading')
      } else if (el.classList.contains('loading')) {
        // Needs the if condition because if loading is false and we *don't*
        // have the `loading` animation running, we're on initial pageload and
        // we don't want to run the done animation.

        el.classList.replace('loading', 'done')

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
    <div className="fixed top-0 left-0 right-0 z-50">
      <div ref={ref} className="global-loading-bar h-px bg-accent" />
    </div>
  )
}
