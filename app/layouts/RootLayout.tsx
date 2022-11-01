import { animated, useSpring } from '@react-spring/web'
import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom'
import type { Navigation } from 'react-router-dom'

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
  const [prevNav, setPrevNav] = useState<Navigation>()
  const [width, setWidth] = useState('0%')
  const [reset, setReset] = useState(false)

  useSetTitle()
  const navigation = useNavigation()

  if (!prevNav) {
    setPrevNav(navigation)
  } else if (prevNav.state !== navigation.state) {
    setPrevNav(navigation)

    if (prevNav && navigation.location && prevNav.location === undefined) {
      setWidth('0%')
      setReset(true)
    } else {
      setReset(false)
    }

    if (navigation.state === 'idle' && prevNav.state === 'loading') {
      setWidth('100%')
    }

    if (prevNav && navigation.state === 'loading' && prevNav.state === 'idle') {
      setWidth('10%')
    }
  }

  const style = useSpring({
    from: { width: '0%' },
    to: { width: width },
    reset: reset,
    onRest: () => {
      setWidth('0%')
      setReset(true)
    },
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
