/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Outlet } from 'react-router-dom'

import { PageActionsTarget } from '~/components/PageActions'
import { Pagination } from '~/components/Pagination'
import { SkipLinkTarget } from '~/ui/lib/SkipLink'
import { classed } from '~/util/classed'

export const PageContainer = classed.div`min-h-screen pt-[var(--navigation-height)] [overscroll-behavior-y:none]`

// TODO: this doesn't go tall enough on a tall screen to get the pagination bar to the bottom
// http://localhost:4000/projects/mock-project/disks
export function ContentPane() {
  return (
    <div className="ml-[var(--sidebar-width)] flex min-h-full flex-col" id="content_pane">
      <div className="flex grow flex-col pb-8 md-:pb-16">
        <SkipLinkTarget />
        <main className="[&>*]:gutter">
          <Outlet />
        </main>
      </div>
      <div className="sticky bottom-0 z-topBar flex-shrink-0 justify-between overflow-hidden border-t bg-default border-secondary empty:border-t-0">
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
  <div
    className="ml-[var(--sidebar-width)] flex min-h-full flex-col overflow-auto"
    id="content_pane"
  >
    <div className="flex grow flex-col">
      <SkipLinkTarget />
      <main className="[&>*]:gutter h-full">
        <Outlet />
      </main>
    </div>
  </div>
)
