/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useLocation } from 'react-router'

import {
  Access16Icon,
  Folder16Icon,
  Images16Icon,
  Metrics16Icon,
  PersonGroup16Icon,
} from '@oxide/design-system/icons/react'

import { DocsLinkItem, NavLinkItem, Sidebar } from '~/components/Sidebar'
import { TopBar } from '~/components/TopBar'
import { useCurrentUser } from '~/hooks/use-current-user'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { Divider } from '~/ui/lib/Divider'
import { pb } from '~/util/path-builder'

import { ContentPane, PageContainer } from './helpers'

export default function SiloLayout() {
  const { pathname } = useLocation()
  const { me } = useCurrentUser()

  useQuickActions(
    () =>
      [
        { value: 'Projects', path: pb.projects() },
        { value: 'Images', path: pb.siloImages() },
        { value: 'Utilization', path: pb.siloUtilization() },
        { value: 'Silo Access', path: pb.siloAccess() },
        { value: 'Users & Groups', path: pb.siloUsers() },
      ]
        // filter out the entry for the path we're currently on
        .filter((i) => i.path !== pathname)
        .map((i) => ({
          navGroup: `Silo '${me.siloName}'`,
          value: i.value,
          action: i.path,
        })),
    [pathname, me.siloName]
  )

  // Users & Groups spans two sibling routes, so highlight the nav item on both
  const inUsersGroups = [pb.siloUsers(), pb.siloGroups()].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  return (
    <PageContainer>
      <TopBar systemOrSilo="silo" />
      <Sidebar>
        <Sidebar.Nav>
          <DocsLinkItem />
        </Sidebar.Nav>
        <Divider />
        <Sidebar.Nav heading={me.siloName}>
          <NavLinkItem to={pb.projects()}>
            <Folder16Icon /> Projects
          </NavLinkItem>
          <NavLinkItem to={pb.siloImages()}>
            <Images16Icon /> Images
          </NavLinkItem>
          <NavLinkItem to={pb.siloUtilization()}>
            <Metrics16Icon /> Utilization
          </NavLinkItem>
          <NavLinkItem to={pb.siloAccess()} end>
            <Access16Icon /> Silo Access
          </NavLinkItem>
          <NavLinkItem to={pb.siloUsers()} isActive={inUsersGroups}>
            <PersonGroup16Icon /> Users & Groups
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}
