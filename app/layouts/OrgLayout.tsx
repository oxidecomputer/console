import { Outlet } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { Pagination } from '@oxide/pagination'
import { SkipLinkTarget } from '@oxide/ui'

import { PageActionsTarget } from 'app/components/PageActions'
import { ProjectSelector } from 'app/components/ProjectSelector'

import { Breadcrumbs } from '../components/Breadcrumbs'
import { NavLinkItem, Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'
import { useRequiredParams } from '../hooks'
import {
  ContentPane,
  ContentPaneActions,
  ContentPaneWrapper,
  PageContainer,
} from './helpers'

// We need to use absolute paths here because sometimes this layout is rendered
// at `/orgs/:orgName` and other times it's rendered at `/orgs/:orgName/access`.
// Relative paths would resolve differently in the two locations.

const OrgLayout = () => {
  const { orgName } = useRequiredParams('orgName')
  const { data: projects } = useApiQuery('projectList', {
    orgName,
    limit: 10,
  })

  return (
    <PageContainer>
      <Sidebar>
        <ProjectSelector />
        <Sidebar.Nav heading="projects">
          {projects?.items.map((project) => (
            <NavLinkItem key={project.id} to={`/orgs/${orgName}/projects/${project.name}`}>
              {project.name}
            </NavLinkItem>
          ))}
        </Sidebar.Nav>
        <Sidebar.Nav heading="Organization">
          <NavLinkItem to={`/orgs/${orgName}/access`}>Access &amp; IAM</NavLinkItem>
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
