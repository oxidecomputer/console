import React from 'react'
import { Outlet } from 'react-router-dom'

import { SkipLinkTarget } from '@oxide/ui'
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
        <Outlet />
      </ContentPane>
    </ContentPaneWrapper>
  </PageContainer>
)

export default RootLayout
