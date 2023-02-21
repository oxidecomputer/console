import { Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'
import { classed } from '@oxide/util'

import { PageActionsTarget } from 'app/components/PageActions'

export const PageContainer = classed.div`grid h-screen grid-cols-[14.25rem,1fr] grid-rows-[60px,1fr]`

export const ContentPane = () => (
  // IMPORTANT: We have patched React Router's <ScrollRestoration> to use this
  // container instead of window as the scroll container. This exact ID has to
  // be on this element for that to work.
  <div id="content-pane" className="flex flex-col overflow-auto">
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

/** Loader for the `<Route>` that wraps all authenticated routes. */
export const userLoader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('sessionMe', {}),
    apiQueryClient.prefetchQuery('sessionMeGroups', {}),
    // Need to prefetch this because every layout hits it when deciding whether
    // to show the silo/system picker. It's also fetched by the SystemLayout
    // loader to figure out whether to 404, but RQ dedupes the request.
    apiQueryClient.prefetchQuery('systemPolicyViewV1', {}),
  ])
  return null
}
