import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { matchPath, useLocation, useNavigate, useParams } from 'react-router-dom'

import Icon from '@oxide/icons'
import { Divider } from '@oxide/ui'

import { TopBar } from 'app/components/TopBar'
import {
  InstancePicker,
  OrgPicker,
  ProjectPicker,
  useSiloSystemPicker,
} from 'app/components/TopBarPicker'
import { useProjectSelector, useQuickActions } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { DocsLinkItem, NavLinkItem, Sidebar } from '../components/Sidebar'
import { ContentPane, PageContainer } from './helpers'

type ProjectLayoutProps = {
  /** Sometimes we need a different layout for the content pane. Like
   * `<ContentPane />`, the element passed here should contain an `<Outlet />`.
   */
  overrideContentPane?: ReactElement
}

const ProjectLayout = ({ overrideContentPane }: ProjectLayoutProps) => {
  const navigate = useNavigate()
  // org and project will always be there, instance may not
  const projectSelector = useProjectSelector()
  const { project } = projectSelector
  const { instance } = useParams()
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
            navGroup: `Project '${project}'`,
            value: i.value,
            // TODO: Update this to use the new path builder
            onSelect: () => navigate(i.path),
          })),
      [currentPath, navigate, project]
    )
  )

  return (
    <PageContainer>
      <TopBar>
        {useSiloSystemPicker('silo')}
        <OrgPicker />
        <ProjectPicker />
        {instance && <InstancePicker />}
      </TopBar>
      <Sidebar>
        <Sidebar.Nav>
          <NavLinkItem to={pb.projects(projectSelector)} end>
            <Icon.Folder16 />
            Projects
          </NavLinkItem>
          <DocsLinkItem />
        </Sidebar.Nav>
        <Divider />
        <Sidebar.Nav heading={project}>
          <NavLinkItem to={pb.instances(projectSelector)}>
            <Icon.Instances16 /> Instances
          </NavLinkItem>
          <NavLinkItem to={pb.snapshots(projectSelector)}>
            <Icon.Snapshots16 /> Snapshots
          </NavLinkItem>
          <NavLinkItem to={pb.disks(projectSelector)}>
            <Icon.Storage16 /> Disks
          </NavLinkItem>
          <NavLinkItem to={pb.projectAccess(projectSelector)}>
            <Icon.Access16 /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to={pb.projectImages(projectSelector)}>
            <Icon.Images16 /> Images
          </NavLinkItem>
          <NavLinkItem to={pb.vpcs(projectSelector)}>
            <Icon.Networking16 /> Networking
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      {overrideContentPane || <ContentPane />}
    </PageContainer>
  )
}

export default ProjectLayout
