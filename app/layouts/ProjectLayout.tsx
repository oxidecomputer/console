import { useMemo } from 'react'
import { Outlet, useNavigate, useLocation, matchPath } from 'react-router-dom'

import {
  SkipLinkTarget,
  Access16Icon,
  Instances16Icon,
  Networking16Icon,
  Storage16Icon,
  Notification16Icon,
  Resize16Icon,
} from '@oxide/ui'
import {
  ContentPane,
  ContentPaneWrapper,
  PageContainer,
  ContentPaneActions,
} from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { TopBar } from '../components/TopBar'
import { Sidebar, NavLinkItem } from '../components/Sidebar'
import { PageHeader } from '../components/PageHeader'
import { useParams, useQuickActions } from 'app/hooks'
import { Pagination } from '@oxide/pagination'
import { Form } from 'app/components/form'

const ProjectLayout = () => {
  const navigate = useNavigate()
  const { projectName } = useParams('orgName', 'projectName')
  const currentPath = useLocation().pathname
  useQuickActions(
    useMemo(
      () =>
        [
          { value: 'Instances', path: 'instances' },
          { value: 'Snapshots', path: 'snapshots' },
          { value: 'Disks', path: 'disks' },
          { value: 'Access & IAM', path: 'access' },
          { value: 'Images', path: 'images' },
          { value: 'Networking', path: 'vpcs' },
        ]
          // filter out the entry for the path we're currently on
          .filter((i) => !matchPath(`/orgs/:org/projects/:project/${i.path}`, currentPath))
          .map((i) => ({
            navGroup: `Project '${projectName}'`,
            value: i.value,
            onSelect: () => navigate(i.path),
          })),
      [currentPath, navigate, projectName]
    )
  )

  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Nav heading="project">
          <NavLinkItem to="instances">
            <Instances16Icon /> Instances
          </NavLinkItem>
          <NavLinkItem to="snapshots">
            <Notification16Icon /> Snapshots
          </NavLinkItem>
          <NavLinkItem to="disks">
            <Storage16Icon /> Disks
          </NavLinkItem>
          <NavLinkItem to="access">
            <Access16Icon title="Access & IAM" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="images">
            <Resize16Icon title="images" /> Images
          </NavLinkItem>
          <NavLinkItem to="vpcs">
            <Networking16Icon /> Networking
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPaneWrapper>
        <ContentPane>
          <TopBar />
          <Breadcrumbs />
          <SkipLinkTarget />
          <PageHeader />
          <Outlet />
        </ContentPane>
        <ContentPaneActions>
          <Pagination.Target />
          <Form.PageActions />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default ProjectLayout
