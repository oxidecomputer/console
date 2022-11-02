import cn from 'classnames'
import { useEffect, useState } from 'react'
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
  const loading = useNavigation().state === 'loading'

  const [state, setState] = useState<'idle' | 'start' | 'middle' | 'done'>('idle')

  console.log({ loading, state })

  // one problem here is it's pretty hard to do a reset if we get another
  // navigation while the current one is running

  useEffect(() => {
    // transition from idle to start
    if (loading && state === 'idle') {
      setState('start')
      setTimeout(() => setState('middle'), 150)
    }

    // transition from loading to done
    if (!loading && (state === 'start' || state === 'middle')) {
      setState('done')
      setTimeout(() => setState('idle'), 200)
    }
  }, [state, loading])

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={cn('global-loading-bar h-px bg-accent', state)} />
    </div>
  )
}
