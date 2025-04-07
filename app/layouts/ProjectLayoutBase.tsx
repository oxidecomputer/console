/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo, type ReactElement } from 'react'
import { useLocation, useNavigate, type LoaderFunctionArgs } from 'react-router'

import { apiq, queryClient, usePrefetchedQuery } from '@oxide/api'
import {
  Access16Icon,
  Affinity16Icon,
  Folder16Icon,
  Images16Icon,
  Instances16Icon,
  IpGlobal16Icon,
  Networking16Icon,
  Snapshots16Icon,
  Storage16Icon,
} from '@oxide/design-system/icons/react'

import { TopBar } from '~/components/TopBar'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { Divider } from '~/ui/lib/Divider'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { DocsLinkItem, NavLinkItem, Sidebar } from '../components/Sidebar'
import { ContentPane, PageContainer } from './helpers'

export const projectLayoutHandle = makeCrumb(
  (p) => p.project!,
  (p) => pb.project(getProjectSelector(p))
)

type ProjectLayoutProps = {
  /** Sometimes we need a different layout for the content pane. Like
   * `<ContentPane />`, the element passed here should contain an `<Outlet />`.
   */
  overrideContentPane?: ReactElement
}

const projectView = ({ project }: PP.Project) => apiq('projectView', { path: { project } })

export async function projectLayoutLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  await queryClient.prefetchQuery(projectView({ project }))
  return null
}

export function ProjectLayoutBase({ overrideContentPane }: ProjectLayoutProps) {
  const navigate = useNavigate()
  // project will always be there, instance may not
  const projectSelector = useProjectSelector()
  const { data: project } = usePrefetchedQuery(projectView(projectSelector))

  const { pathname } = useLocation()
  useQuickActions(
    useMemo(
      () =>
        [
          { value: 'Instances', path: pb.instances(projectSelector) },
          { value: 'Disks', path: pb.disks(projectSelector) },
          { value: 'Snapshots', path: pb.snapshots(projectSelector) },
          { value: 'Images', path: pb.projectImages(projectSelector) },
          { value: 'VPCs', path: pb.vpcs(projectSelector) },
          { value: 'Floating IPs', path: pb.floatingIps(projectSelector) },
          { value: 'Affinity Groups', path: pb.affinity(projectSelector) },
          { value: 'Access', path: pb.projectAccess(projectSelector) },
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
      <TopBar systemOrSilo="silo" />
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
            <Images16Icon /> Images
          </NavLinkItem>
          <NavLinkItem to={pb.vpcs(projectSelector)}>
            <Networking16Icon /> VPCs
          </NavLinkItem>
          <NavLinkItem to={pb.floatingIps(projectSelector)}>
            <IpGlobal16Icon /> Floating IPs
          </NavLinkItem>
          <NavLinkItem to={pb.affinity(projectSelector)}>
            <Affinity16Icon /> Affinity Groups
          </NavLinkItem>
          <NavLinkItem to={pb.projectAccess(projectSelector)}>
            <Access16Icon /> Access
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      {overrideContentPane || <ContentPane />}
    </PageContainer>
  )
}
