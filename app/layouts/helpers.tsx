import { Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'
import { classed } from '@oxide/util'

import { PageActionsTarget } from 'app/components/PageActions'
import { TopBar } from 'app/components/TopBar'

export const PageContainer = classed.div`grid h-screen grid-cols-[13.75rem,1fr]`

/** `children` is where the TopBar pickers go */
export function ContentPane({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-auto">
      <div className="flex flex-grow flex-col pb-8">
        <TopBar>{children}</TopBar>
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

export async function prefetchSessionMe() {
  await apiQueryClient.prefetchQuery('sessionMe', {})
}
