import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { SkipLinkTarget, Spinner } from '@oxide/ui'
import {
  ContentPane,
  ContentPaneWrapper,
  PageContainer,
  Sidebar,
} from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { TopBar } from '../components/TopBar'

const RootLayout = () => (
  <PageContainer>
    <Sidebar>TBD</Sidebar>
    <ContentPaneWrapper>
      <ContentPane>
        <TopBar />
        <Breadcrumbs />
        <SkipLinkTarget />
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </ContentPane>
    </ContentPaneWrapper>
  </PageContainer>
)

export default RootLayout
