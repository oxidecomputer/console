import { Outlet } from 'react-router-dom'

import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'
import { classed } from '@oxide/util'

import { PageActionsTarget } from 'app/components/PageActions'
import { TopBar } from 'app/components/TopBar'

export const PageContainer = classed.div`grid h-screen grid-cols-[13.75rem,1fr]`

export function ContentPane({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-auto">
      <div className="relative flex flex-grow flex-col pb-10">
        <TopBar>{children}</TopBar>
        <SkipLinkTarget />
        <main className="[&>*]:gutter">
          <Outlet />
        </main>
      </div>
      <div className="sticky bottom-0 flex-shrink-0 justify-between overflow-hidden bg-default border-t border-secondary empty:border-t-0">
        <Pagination.Target />
        <PageActionsTarget />
      </div>
    </div>
  )
}
