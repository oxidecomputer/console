import { useRef } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'
import { classed } from '@oxide/util'

import { PageActionsTarget } from 'app/components/PageActions'

export const PageContainer = classed.div`grid h-screen grid-cols-[14.25rem,1fr] grid-rows-[60px,1fr]`

export function ContentPane() {
  const ref = useRef(null)
  return (
    <div ref={ref} className="flex flex-col overflow-auto">
      {/* @ts-expect-error */}
      <ScrollRestoration elementRef={ref} />
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
  <div id="content-pane" className="flex flex-col overflow-auto">
    <div className="flex flex-grow flex-col">
      <SkipLinkTarget />
      <main className="[&>*]:gutter h-full">
        <Outlet />
      </main>
    </div>
  </div>
)

/** Loader for the `<Route>` that wraps all authenticated routes. */
export const userLoader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('currentUserView', {}),
    apiQueryClient.prefetchQuery('currentUserGroups', {}),
    // Need to prefetch this because every layout hits it when deciding whether
    // to show the silo/system picker. It's also fetched by the SystemLayout
    // loader to figure out whether to 404, but RQ dedupes the request.
    apiQueryClient.fetchQuery('systemPolicyView', {}).catch(() => {
      console.log('/api/v1/system/policy 403 is expected if user is not a fleet viewer.')
    }),
  ])
  return null
}
