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
import { classed } from '~/util/classed'

export const PageContainer = classed.div`min-h-full pt-[calc(var(--top-bar-height)+var(--preview-banner-height))]`

// shared with PageSkeleton so the skeleton doesn't drift from the real layout
export const topBarWrapperClass =
  'bg-default border-secondary fixed top-(--preview-banner-height) right-0 left-0 z-(--z-top-bar) grid h-(--top-bar-height) grid-cols-[1fr] 1000:grid-cols-[var(--sidebar-width)_1fr] border-b'
// home button cell only exists at desktop width — on mobile the sidebar is an
// overlay toggled from the top bar, so the top bar is a single cell
export const topBarHomeCellClass = 'border-secondary hidden items-center border-r 1000:flex'
// below the 1000px breakpoint the sidebar becomes an overlay whose visibility
// is controlled by translate-x classes in Sidebar (and PageSkeleton, which
// always renders it closed)
export const sidebarWrapperClass =
  'bg-default border-secondary fixed top-[calc(var(--top-bar-height)+var(--preview-banner-height))] bottom-0 left-0 w-(--sidebar-width) border-r max-1000:z-(--z-side-modal) max-1000:transition-transform max-1000:duration-200 max-1000:ease-out motion-reduce:max-1000:transition-none'

export function ContentPane() {
  useScrollRestoration()
  return (
    <div className="light:bg-raise 1000:ml-(--sidebar-width) flex min-h-[calc(100vh-var(--top-bar-height)-var(--preview-banner-height))] flex-col">
      <div className="flex grow flex-col pb-8">
        {/* id/tabIndex make this the skip link target and where useRouteAnnouncer
            puts focus after a nav. It has to be a real element in the a11y tree
            (not an empty div) or the VoiceOver cursor won't follow the focus. */}
        <main id="content" tabIndex={-1} className="*:gutter outline-none">
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
  <div className="1000:ml-(--sidebar-width) flex h-[calc(100vh-var(--top-bar-height)-var(--preview-banner-height))] flex-col overflow-hidden">
    <main id="content" tabIndex={-1} className="*:gutter h-full outline-none">
      <Outlet />
    </main>
  </div>
)
