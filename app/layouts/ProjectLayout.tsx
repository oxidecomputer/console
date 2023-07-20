/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactElement } from 'react'
import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { matchPath, useLocation, useNavigate, useParams } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
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
  ProjectPicker,
  SiloSystemPicker,
} from 'app/components/TopBarPicker'
import { getProjectSelector, useProjectSelector, useQuickActions } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { DocsLinkItem, NavLinkItem, Sidebar } from '../components/Sidebar'
import { ContentPane, PageContainer } from './helpers'

type ProjectLayoutProps = {
  /** Sometimes we need a different layout for the content pane. Like
   * `<ContentPane />`, the element passed here should contain an `<Outlet />`.
   */
  overrideContentPane?: ReactElement
}

const projectPathPattern = pb.project({ project: ':project' })

ProjectLayout.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('projectView', {
    path: getProjectSelector(params),
  })
  return null
}

function ProjectLayout({ overrideContentPane }: ProjectLayoutProps) {
  const navigate = useNavigate()
  // project will always be there, instance may not
  const projectSelector = useProjectSelector()
  const { data: project } = usePrefetchedApiQuery('projectView', { path: projectSelector })

  const { instance } = useParams()
  const currentPath = useLocation().pathname
  useQuickActions(
    useMemo(
      () =>
        [
          { value: 'Instances', path: 'instances' },
          { value: 'Disks', path: 'disks' },
          { value: 'Snapshots', path: 'snapshots' },
          { value: 'Images', path: 'images' },
          { value: 'Networking', path: 'vpcs' },
          { value: 'Access & IAM', path: 'access' },
        ]
          // filter out the entry for the path we're currently on
          .filter((i) => !matchPath(`${projectPathPattern}/${i.path}`, currentPath))
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
        <SiloSystemPicker value="silo" />
        <ProjectPicker project={project} />
        {instance && <InstancePicker />}
      </TopBar>
      <Sidebar>
        <Sidebar.Nav>
          <NavLinkItem to={pb.projects()} end>
            <Folder16Icon />
            Projects
          </NavLinkItem>
          <DocsLinkItem />
        </Sidebar.Nav>
        <Divider />
        <Sidebar.Nav heading={project.name}>
          <NavLinkItem to={pb.instances(projectSelector)}>
            <Instances16Icon /> Instances
          </NavLinkItem>
          <NavLinkItem to={pb.disks(projectSelector)}>
            <Storage16Icon /> Disks
          </NavLinkItem>
          <NavLinkItem to={pb.snapshots(projectSelector)}>
            <Snapshots16Icon /> Snapshots
          </NavLinkItem>
          <NavLinkItem to={pb.projectImages(projectSelector)}>
            <Images16Icon title="images" /> Images
          </NavLinkItem>
          <NavLinkItem to={pb.vpcs(projectSelector)}>
            <Networking16Icon /> Networking
          </NavLinkItem>
          <NavLinkItem to={pb.projectAccess(projectSelector)}>
            <Access16Icon title="Access & IAM" /> Access &amp; IAM
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      {overrideContentPane || <ContentPane />}
    </PageContainer>
  )
}

export default ProjectLayout
