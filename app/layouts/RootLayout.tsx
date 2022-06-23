import { Outlet } from 'react-router-dom'

import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'

import { PageActionsTarget } from 'app/components/PageActions'

import { Breadcrumbs } from '../components/Breadcrumbs'
import { TopBar } from '../components/TopBar'
import {
  ContentPane,
  ContentPaneActions,
  ContentPaneWrapper,
  PageContainer,
  Sidebar,
} from './helpers'

const RootLayout = () => {
  return (
    <PageContainer>
      <Sidebar>TBD</Sidebar>
      <ContentPaneWrapper>
        <ContentPane>
          <TopBar />
          <Breadcrumbs />
          <SkipLinkTarget />
          <Outlet />
        </ContentPane>
        <ContentPaneActions>
          <Pagination.Target />
          <PageActionsTarget />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default RootLayout
