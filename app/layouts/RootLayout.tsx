import { Outlet } from 'react-router-dom'

import { SkipLinkTarget } from '@oxide/ui'
import {
  ContentPane,
  ContentPaneActions,
  ContentPaneWrapper,
  PageContainer,
  Sidebar,
} from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { TopBar } from '../components/TopBar'
import { Pagination } from '@oxide/pagination'
import { PageFormActions } from 'app/components/form'

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
          <PageFormActions />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default RootLayout
