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
import { useLocation, useNavigate, useParams } from 'react-router-dom'

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
  const { pathname } = useLocation()
  useQuickActions(
    useMemo(
      () =>
        [
          { value: 'Instances', path: pb.instances(projectSelector) },
          { value: 'Disks', path: pb.disks(projectSelector) },
          { value: 'Snapshots', path: pb.snapshots(projectSelector) },
          { value: 'Images', path: pb.projectImages(projectSelector) },
          { value: 'Networking', path: pb.vpcs(projectSelector) },
          { value: 'Access & IAM', path: pb.projectAccess(projectSelector) },
        ]
          // filter out the entry for the path we're currently on
          .filter((i) => i.path !== pathname)
          .map((i) => ({
            navGroup: `Project '${project.name}'`,
            value: i.value,
            onSelect: () => navigate(i.path),
          })),
      [pathname, navigate, project.name, projectSelector]
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
