import { Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'
import { classed } from '@oxide/util'

import { PageActionsTarget } from 'app/components/PageActions'

export const PageContainer = classed.div`grid h-screen grid-cols-[14.25rem,1fr] grid-rows-[60px,1fr]`

export const ContentPane = () => (
  <div className="flex flex-col overflow-auto">
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

export async function prefetchUserData() {
  await Promise.all([
    apiQueryClient.prefetchQuery('sessionMe', {}),
    apiQueryClient.prefetchQuery('systemPolicyView', {}),
  ])
}
