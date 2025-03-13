/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useLocation } from 'react-router'

import { PageContainer } from '~/layouts/helpers'
import { classed } from '~/util/classed'

const Block = classed.div`motion-safe:animate-pulse2 rounded bg-tertiary`

export function PageSkeleton({ skipPaths }: { skipPaths?: RegExp[] }) {
  const { pathname } = useLocation()

  // HACK: we can only hang a HydrateFallback off the root route/layout, so in
  // order to avoid rendering this skeleton on pages that don't have this grid
  // layout, all we can do is match the path
  if (skipPaths?.some((regex) => regex.test(pathname))) return null

  return (
    <PageContainer>
      <div className="flex items-center gap-2 border-b border-r p-3 border-secondary">
        <Block className="h-8 w-8" />
        <Block className="h-4 w-24" />
      </div>
      <div className="border-b border-secondary" />
      <div className="border-r p-4 border-secondary">
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
      <div className="" />
    </PageContainer>
  )
}
