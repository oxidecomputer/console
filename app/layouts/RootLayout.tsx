import { animated, config, useSpring } from '@react-spring/web'
import { useEffect } from 'react'
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

function LoadingBar() {
  const isLoading = useNavigation().state === 'loading'

  const initialJump = useSpring(
    isLoading
      ? {
          from: { width: '0%', opacity: 1 },
          // TODO: would be nice to have the thing keep moving slowly instead of
          // hanging out at 30% but I couldn't get it to look right
          to: { width: '30%', opacity: 1 },
          // start animation over if you nav while navving (technically if
          // anything triggers another render while nav is happening, but the
          // only thing that triggers renders in this function is useNavigation)
          reset: isLoading,
          // sometimes navs are instantaneous due to RQ cache. a small delay
          // lets us avoid flashing the animation very briefly
          delay: 5,
        }
      : {
          to: {
            width: '100%',
            opacity: 0,
            config: (key: string) => (key === 'opacity' ? config.molasses : config.stiff),
          },
        }
  )

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <animated.div style={initialJump} className="h-px bg-accent" />
    </div>
  )
}
