import { useMemo } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'

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

import { useQuickActions, useRequiredParams } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { DocsLinkItem, NavLinkItem, Sidebar } from '../components/Sidebar'
import { Layout } from './helpers'

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
    <Layout>
      <Sidebar.Nav>
        <NavLinkItem to={pb.projects({ orgName })} end>
          <Folder16Icon />
          Projects
        </NavLinkItem>
        <DocsLinkItem />
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
    </Layout>
  )
}

export default ProjectLayout
