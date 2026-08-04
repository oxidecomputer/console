/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import { Outlet } from 'react-router'

import { MswBanner } from '~/components/MswBanner'
import { ToastStack } from '~/components/ToastStack'
import { useCrumbs } from '~/hooks/use-crumbs'
import { useApplyTheme } from '~/stores/theme'

/**
 * non top-level route: Instances / mock-project / Projects / maze-war / Oxide Console
 * top-level route: Oxide Console
 */
const useTitle = () =>
  useCrumbs()
    .map((c) => c.label)
    .reverse()
    .concat('Oxide Console') // if there are no crumbs, we're still Oxide Console
    .join(' / ')

/**
 * Root layout that applies to the entire app. Modify sparingly. It's rare for
 * anything to actually belong here.
 */
export default function RootLayout() {
  useApplyTheme()
  const title = useTitle()
  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <>
      {process.env.MSW_BANNER ? <MswBanner /> : null}
      <Outlet />
      <ToastStack />
    </>
  )
}
