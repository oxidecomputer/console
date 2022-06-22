import { Outlet } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'

import { PageActionsTarget } from 'app/components/PageActions'
import { ProjectSelector } from 'app/components/ProjectSelector'

import { Breadcrumbs } from '../components/Breadcrumbs'
import { NavLinkItem, Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'
import { useParams } from '../hooks'
import {
  ContentPane,
  ContentPaneActions,
  ContentPaneWrapper,
  PageContainer,
} from './helpers'

const OrgLayout = () => {
  const { orgName } = useParams('orgName')
  const { data: projects } = useApiQuery('organizationProjectsGet', {
    orgName,
    limit: 10,
  })
  return (
    <PageContainer>
      <Sidebar>
        <ProjectSelector />
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
        <ContentPaneActions>
          <Pagination.Target />
          <PageActionsTarget />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default OrgLayout
