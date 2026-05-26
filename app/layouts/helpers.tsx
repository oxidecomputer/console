/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Outlet } from 'react-router'

import { PageActionsTarget } from '~/components/PageActions'
import { Pagination } from '~/components/Pagination'
import { useScrollRestoration } from '~/hooks/use-scroll-restoration'
import { SkipLinkTarget } from '~/ui/lib/SkipLink'
import { classed } from '~/util/classed'

export const PageContainer = classed.div`min-h-full pt-(--top-bar-height)`

// shared with PageSkeleton so the skeleton doesn't drift from the real layout
export const topBarWrapperClass =
  'bg-default border-secondary fixed top-0 right-0 left-0 z-(--z-top-bar) grid h-(--top-bar-height) grid-cols-[var(--sidebar-width)_1fr] border-b'
export const sidebarWrapperClass =
  'border-secondary fixed top-(--top-bar-height) bottom-0 left-0 w-(--sidebar-width) border-r'

export function ContentPane() {
  useScrollRestoration()
  return (
    <div
      className="light:bg-raise 1000:ml-(--sidebar-width) flex min-h-[calc(100vh-var(--top-bar-height))] flex-col"
      id="scroll-container"
      data-testid="scroll-container"
    >
      <div className="flex grow flex-col pb-8">
        <SkipLinkTarget />
        <main className="*:gutter">
          <Outlet />
        </main>
      </div>
      <div className="bg-default border-secondary sticky bottom-0 z-(--z-top-bar) shrink-0 justify-between overflow-hidden border-t empty:border-t-0">
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
  <div className="1000:ml-(--sidebar-width) flex h-[calc(100vh-var(--top-bar-height))] flex-col overflow-hidden">
    <SkipLinkTarget />
    <main className="*:gutter h-full">
      <Outlet />
    </main>
  </div>
)
