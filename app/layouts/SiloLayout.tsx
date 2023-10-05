/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Access16Icon, Divider, Folder16Icon, Images16Icon, Metrics16Icon } from '@oxide/ui'

import { DocsLinkItem, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { TopBar } from 'app/components/TopBar'
import { ProjectPicker, SiloSystemPicker } from 'app/components/TopBarPicker'
import { useQuickActions } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { useCurrentUser } from './AuthenticatedLayout'
import { ContentPane, PageContainer } from './helpers'

export function SiloLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { me } = useCurrentUser()

  useQuickActions(
    useMemo(
      () =>
        [
          { value: 'Projects', path: pb.projects() },
          { value: 'Images', path: pb.siloImages() },
          { value: 'Utilization', path: pb.siloUtilization() },
          { value: 'Access & IAM', path: pb.siloAccess() },
        ]
          // filter out the entry for the path we're currently on
          .filter((i) => i.path !== pathname)
          .map((i) => ({
            navGroup: `Silo '${me.siloName}'`,
            value: i.value,
            onSelect: () => navigate(i.path),
          })),
      [pathname, navigate, me.siloName]
    )
  )

  return (
    <PageContainer>
      <TopBar>
        <SiloSystemPicker value="silo" />
        <ProjectPicker />
      </TopBar>
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
          <NavLinkItem to={pb.siloAccess()}>
            <Access16Icon /> Access & IAM
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}
