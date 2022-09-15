import { useMemo } from 'react'
import { Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom'

import { Pagination } from '@oxide/pagination'
import {
  Access16Icon,
  Divider,
  Folder16Icon,
  Images16Icon,
  Instances16Icon,
  Networking16Icon,
  SkipLinkTarget,
  Snapshots16Icon,
  Storage16Icon,
} from '@oxide/ui'

import { PageActionsTarget } from 'app/components/PageActions'
import { useQuickActions, useRequiredParams } from 'app/hooks'

import { DocsLink, JumpToButton, NavLinkItem, Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'
import {
  ContentPane,
  ContentPaneActions,
  ContentPaneWrapper,
  PageContainer,
} from './helpers'

const ProjectLayout = () => {
  const navigate = useNavigate()
  const { orgName, projectName } = useRequiredParams('orgName', 'projectName')
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
        <Sidebar.Header>
          {/* TODO: the actual silo obviously */}
          <div className="text-mono-sm text-tertiary">Silo</div>
          <div className="text-sans-sm text-secondary">console.bitmapbros.com</div>
        </Sidebar.Header>
        <div className="mx-3 mt-4">
          {/* TODO: click should open jump to menu */}
          <JumpToButton onClick={() => {}} />
        </div>
        <Sidebar.Nav>
          <NavLinkItem to={`/orgs/${orgName}/projects`} end>
            <Folder16Icon />
            Projects
          </NavLinkItem>
          <li>
            {/* TODO: this probably doesn't just go to the docs root. maybe it even opens
                a menu with links to several relevant docs */}
            <DocsLink />
          </li>
        </Sidebar.Nav>
        <Divider />
        <Sidebar.Nav heading={projectName}>
          <NavLinkItem to="instances">
            <Instances16Icon /> Instances
          </NavLinkItem>
          <NavLinkItem to="snapshots">
            <Snapshots16Icon /> Snapshots
          </NavLinkItem>
          <NavLinkItem to="disks">
            <Storage16Icon /> Disks
          </NavLinkItem>
          <NavLinkItem to="access">
            <Access16Icon title="Access & IAM" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="images">
            <Images16Icon title="images" /> Images
          </NavLinkItem>
          <NavLinkItem to="vpcs">
            <Networking16Icon /> Networking
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPaneWrapper>
        <ContentPane>
          <TopBar />
          <SkipLinkTarget />
          <div className="gutter">
            <Outlet />
          </div>
        </ContentPane>
        <ContentPaneActions>
          <Pagination.Target />
          <PageActionsTarget />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default ProjectLayout
