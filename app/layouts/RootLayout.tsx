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

const RootLayout = () => (
  <PageContainer>
    <Sidebar>TBD</Sidebar>
    <ContentPaneWrapper>
      <ContentPane>
        <Breadcrumbs />
        <SkipLinkTarget />
        <Outlet />
      </ContentPane>
    </ContentPaneWrapper>
  </PageContainer>
)

export default RootLayout
