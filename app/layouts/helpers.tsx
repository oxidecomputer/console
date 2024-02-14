/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useRef } from 'react'
import { Outlet } from 'react-router-dom'

import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'
import { classed } from '@oxide/util'

import { PageActionsTarget } from 'app/components/PageActions'
import { useScrollRestoration } from 'app/hooks/use-scroll-restoration'

export const PageContainer = classed.div`grid h-screen grid-cols-[14.25rem,1fr] grid-rows-[60px,1fr]`

export function ContentPane() {
  const ref = useRef<HTMLDivElement>(null)
  useScrollRestoration(ref)
  return (
    <div ref={ref} className="flex flex-col overflow-auto" data-testid="scroll-container">
      <div className="flex flex-grow flex-col pb-8">
        <SkipLinkTarget />
        <main className="[&>*]:gutter">
          <Outlet />
        </main>
      </div>
      <div className="sticky bottom-0 flex-shrink-0 justify-between overflow-hidden border-t bg-default border-secondary empty:border-t-0">
        <Pagination.Target />
        <PageActionsTarget />
      </div>
    </div>
  )
}

/**
 * Special content pane for the serial console that lets us break out of the
 * usual layout. Main differences: no `pb-8` and `<main>` is locked at `h-full`
 * to avoid page-level scroll. We also leave off the pagination and page actions
 * `<div>` because we don't need it.
 */
export const SerialConsoleContentPane = () => (
  <div className="flex flex-col overflow-auto">
    <div className="flex flex-grow flex-col">
      <SkipLinkTarget />
      <main className="[&>*]:gutter h-full">
        <Outlet />
      </main>
    </div>
  </div>
)

export const ExplorerContentPane = () => (
  <div className="flex flex-col overflow-auto">
    <div className="flex flex-grow flex-col">
      <SkipLinkTarget />
      <main className="h-full">
        <Outlet />
      </main>
    </div>
  </div>
)
