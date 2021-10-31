import React from 'react'
import { Outlet } from 'react-router-dom'

import { SkipLinkTarget } from '@oxide/ui'
import { ContentPane, PageContainer, Sidebar } from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'

const RootLayout = () => (
  <PageContainer>
    <Sidebar>TBD</Sidebar>
    <ContentPane>
      <Breadcrumbs />
      <SkipLinkTarget />
      <Outlet />
    </ContentPane>
  </PageContainer>
)

export default RootLayout
