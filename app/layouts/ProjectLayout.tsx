import { useMemo } from 'react'
import { matchPath, useLocation, useNavigate, useParams } from 'react-router-dom'

import {
  Access16Icon,
  Divider,
  Folder16Icon,
  Images16Icon,
  Instances16Icon,
  Networking16Icon,
  Snapshots16Icon,
  Storage16Icon,
} from '@oxide/ui'

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

const ProjectLayout = () => {
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
            <Folder16Icon />
            Projects
          </NavLinkItem>
          <DocsLinkItem />
        </Sidebar.Nav>
        <Divider />
        <Sidebar.Nav heading={project}>
          <NavLinkItem to={pb.instances(projectSelector)}>
            <Instances16Icon /> Instances
          </NavLinkItem>
          <NavLinkItem to={pb.snapshots(projectSelector)}>
            <Snapshots16Icon /> Snapshots
          </NavLinkItem>
          <NavLinkItem to={pb.disks(projectSelector)}>
            <Storage16Icon /> Disks
          </NavLinkItem>
          <NavLinkItem to={pb.projectAccess(projectSelector)}>
            <Access16Icon title="Access & IAM" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to={pb.projectImages(projectSelector)}>
            <Images16Icon title="images" /> Images
          </NavLinkItem>
          <NavLinkItem to={pb.vpcs(projectSelector)}>
            <Networking16Icon /> Networking
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}

export default ProjectLayout
