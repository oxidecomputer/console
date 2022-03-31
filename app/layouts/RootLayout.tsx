import React from 'react'
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
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '@oxide/pagination'
import { Form } from '@oxide/form'

const RootLayout = () => {
  return (
    <PageContainer>
      <Sidebar>TBD</Sidebar>
      <ContentPaneWrapper>
        <ContentPane>
          <TopBar />
          <Breadcrumbs />
          <SkipLinkTarget />
          <PageHeader />
          <Outlet />
        </ContentPane>
        <ContentPaneActions>
          <Pagination.Target />
          <Form.PageActions />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default RootLayout
