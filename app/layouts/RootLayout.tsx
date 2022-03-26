import React from 'react'
import { Outlet } from 'react-router-dom'
import { useTitle } from 'app/hooks/use-title'

import { PageHeader, PageTitle, SkipLinkTarget } from '@oxide/ui'
import {
  ContentPane,
  ContentPaneWrapper,
  PageContainer,
  Sidebar,
} from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { TopBar } from '../components/TopBar'

const RootLayout = () => {
  const [title, icon] = useTitle()
  return (
    <PageContainer>
      <Sidebar>TBD</Sidebar>
      <ContentPaneWrapper>
        <ContentPane>
          <TopBar />
          <Breadcrumbs />
          <SkipLinkTarget />
          {title && (
            <PageHeader>
              <PageTitle icon={icon}>{title}</PageTitle>
            </PageHeader>
          )}
          <Outlet />
        </ContentPane>
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default RootLayout
