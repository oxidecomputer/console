import { animated, useSpring } from '@react-spring/web'
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
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'
  const style = useSpring({
    from: { width: '0%' },
    to: { width: isLoading ? '95%' : '0%' },
    reset: !isLoading,
  })
  return (
    <div>
      <div className="h-px w-full">
        <animated.div style={style} className="h-px bg-accent" />
      </div>
      <Outlet />
      <ScrollRestoration />
    </div>
  )
}
