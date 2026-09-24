/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import cn from 'classnames'
import { useLocation } from 'react-router'

import {
  ContentPane,
  PageContainer,
  sidebarWrapperClass,
  topBarHomeCellClass,
  topBarWrapperClass,
} from '~/layouts/helpers'
import { classed } from '~/util/classed'

const Block = classed.div`motion-safe:animate-pulse2 rounded-md bg-tertiary`

export function PageSkeleton({ skipPaths }: { skipPaths?: RegExp[] }) {
  const { pathname } = useLocation()

  // HACK: we can only hang a HydrateFallback off the root route/layout, so in
  // order to avoid rendering this skeleton on pages that don't have this grid
  // layout, all we can do is match the path
  if (skipPaths?.some((regex) => regex.test(pathname))) return null

  return (
    <PageContainer>
      {/* TopBar */}
      <div className={topBarWrapperClass}>
        <div className={cn(topBarHomeCellClass, 'gap-2 p-3')}>
          <Block className="h-8 w-8" />
          <Block className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-between gap-2 p-3">
          <Block className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Block className="h-6 w-16" />
            <Block className="h-6 w-32" />
          </div>
        </div>
      </div>
      {/* Sidebar */}
      {/* on mobile the sidebar is an overlay, closed (translated off-screen) by default */}
      <div className={cn(sidebarWrapperClass, 'p-4 max-1000:-translate-x-full')}>
        <Block className="mb-10 h-4 w-full" />
        <div className="mb-6 space-y-2">
          <Block className="h-4 w-32" />
          <Block className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Block className="h-4 w-14" />
          <Block className="h-4 w-32" />
          <Block className="h-4 w-24" />
          <Block className="h-4 w-14" />
        </div>
      </div>
      {/* Content */}
      <ContentPane />
    </PageContainer>
  )
}
