import React from 'react'
import { Outlet } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { SkipLinkTarget } from '@oxide/ui'

import {
  ContentPane,
  ContentPaneWrapper,
  PageContainer,
  PaginationContainer,
} from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { TopBar } from '../components/TopBar'
import { useParams } from '../hooks'
import { Sidebar, NavLinkItem } from '../components/Sidebar'

const OrgLayout = () => {
  const { orgName } = useParams('orgName')
  const { data: projects } = useApiQuery('organizationProjectsGet', { orgName })
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
          <Outlet />
        </ContentPane>
        <PaginationContainer id="pagination-target" />
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default OrgLayout
