import React from 'react'
import { Outlet } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { PageHeader, PageTitle, SkipLinkTarget } from '@oxide/ui'
import { useTitle } from 'app/hooks/use-title'

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
  const [title, icon] = useTitle()
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
          {title && (
            <PageHeader>
              <PageTitle icon={icon}>{title}</PageTitle>
            </PageHeader>
          )}
          <Outlet />
        </ContentPane>
        <ContentPaneActions>
          <Pagination.Target />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default OrgLayout
