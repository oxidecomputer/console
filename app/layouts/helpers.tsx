import { Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'

import { PageActionsTarget } from 'app/components/PageActions'
import { Sidebar } from 'app/components/Sidebar'
import { TopBar } from 'app/components/TopBar'

type LayoutProps = {
  /** Sidebar nav contents */
  children: React.ReactNode
  topbarNav?: React.ReactNode
}

export function Layout({ children, topbarNav }: LayoutProps) {
  return (
    <div className="grid h-screen grid-cols-[13.75rem,1fr]">
      <Sidebar>{children}</Sidebar>
      <div className="flex flex-col overflow-auto">
        <div className="flex flex-grow flex-col pb-8">
          <TopBar>{topbarNav}</TopBar>
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
    </div>
  )
}

export async function prefetchSessionMe() {
  await apiQueryClient.prefetchQuery('sessionMe', {})
}
