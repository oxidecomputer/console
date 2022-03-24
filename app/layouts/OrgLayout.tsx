import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { SkipLinkTarget, Spinner } from '@oxide/ui'

import {
  ContentPane,
  ContentPaneWrapper,
  PageContainer,
  ContentPaneActions,
} from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { TopBar } from '../components/TopBar'
import { useParams } from '../hooks'
import { Sidebar, NavLinkItem } from '../components/Sidebar'
import { Pagination } from '@oxide/pagination'

const OrgLayout = () => {
  const { orgName } = useParams('orgName')
  const { data: projects } = useApiQuery('organizationProjectsGet', {
    orgName,
    limit: 10,
  })
  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Nav heading="projects">
          {projects?.items.map((project) => (
            <NavLinkItem key={project.id} to={project.name}>
              {project.name}
            </NavLinkItem>
          ))}
        </Sidebar.Nav>
      </Sidebar>
      <ContentPaneWrapper>
        <ContentPane>
          <TopBar />
          <Breadcrumbs />
          <SkipLinkTarget />
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </ContentPane>
        <ContentPaneActions>
          <Pagination.Target />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default OrgLayout
