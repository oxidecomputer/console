/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import {
  Access16Icon,
  Divider,
  Folder16Icon,
  Images16Icon,
  Snapshots16Icon,
} from '@oxide/ui'

import { DocsLinkItem, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { TopBar } from 'app/components/TopBar'
import { ProjectPicker, SiloSystemPicker } from 'app/components/TopBarPicker'
import { useQuickActions } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { ContentPane, PageContainer } from './helpers'

SiloLayout.loader = async () => {
  await apiQueryClient.prefetchQuery('currentUserView', {})
  return null
}

export function SiloLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data: user } = usePrefetchedApiQuery('currentUserView', {})

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
            navGroup: `Silo '${user.siloName}'`,
            value: i.value,
            // TODO: Update this to use the new path builder
            onSelect: () => navigate(i.path),
          })),
      [pathname, navigate, user.siloName]
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
        {/* TODO: silo name in heading */}
        <Sidebar.Nav heading="Silo">
          <NavLinkItem to={pb.projects()}>
            <Folder16Icon /> Projects
          </NavLinkItem>
          <NavLinkItem to={pb.siloImages()}>
            <Images16Icon /> Images
          </NavLinkItem>
          <NavLinkItem to={pb.siloUtilization()}>
            <Snapshots16Icon /> Utilization
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
