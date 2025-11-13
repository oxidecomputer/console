/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { api, q, queryClient } from '@oxide/api'
import {
  Cloud16Icon,
  IpGlobal16Icon,
  Metrics16Icon,
  Servers16Icon,
  SoftwareUpdate16Icon,
} from '@oxide/design-system/icons/react'

import { trigger404 } from '~/components/ErrorBoundary'
import { DocsLinkItem, NavLinkItem, Sidebar } from '~/components/Sidebar'
import { TopBar } from '~/components/TopBar'
import { useCurrentUser } from '~/hooks/use-current-user'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { Divider } from '~/ui/lib/Divider'
import { inventoryBase, pb } from '~/util/path-builder'

import { ContentPane, PageContainer } from './helpers'

/**
 * We need to be a fleet viewer in order to see any of the routes under this
 * layout. We need to `fetchQuery` instead of `prefetchQuery` because the latter
 * doesn't return the result.
 */
export async function clientLoader() {
  const me = await queryClient.fetchQuery(q(api.currentUserView, {}))
  if (!me.fleetViewer) throw trigger404
  return null
}

export default function SystemLayout() {
  // Only show silo picker if we are looking at a particular silo. The more
  // robust way of doing this would be to make a separate layout for the
  // silo-specific routes in the route config, but it's overkill considering
  // this is a one-liner. Switch to that approach at the first sign of trouble.
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const { me } = useCurrentUser()

  const actions = useMemo(() => {
    const systemLinks = [
      { value: 'Silos', path: pb.silos() },
      { value: 'Utilization', path: pb.systemUtilization() },
      { value: 'Inventory', path: pb.sledInventory() },
      { value: 'IP Pools', path: pb.ipPools() },
      { value: 'System Update', path: pb.systemUpdate() },
    ]
      // filter out the entry for the path we're currently on
      .filter((i) => i.path !== pathname)
      .map((i) => ({
        navGroup: 'System',
        value: i.value,
        onSelect: () => navigate(i.path),
      }))

    const backToSilo = {
      navGroup: `Back to silo '${me.siloName}'`,
      value: 'Projects',
      onSelect: () => navigate(pb.projects()),
    }
    return [...systemLinks, backToSilo]
  }, [pathname, navigate, me.siloName])

  useQuickActions(actions)

  return (
    <PageContainer>
      <TopBar systemOrSilo="system" />
      <Sidebar>
        <Sidebar.Nav>
          <DocsLinkItem />
        </Sidebar.Nav>
        <Divider />
        <Sidebar.Nav heading="System">
          <NavLinkItem to={pb.silos()}>
            <Cloud16Icon /> Silos
          </NavLinkItem>
          {/* <NavLinkItem to={pb.systemIssues()} disabled>
            <Instances16Icon /> Issues
          </NavLinkItem> */}
          <NavLinkItem to={pb.systemUtilization()}>
            <Metrics16Icon /> Utilization
          </NavLinkItem>
          <NavLinkItem to={pb.sledInventory()} activePrefix={inventoryBase()}>
            <Servers16Icon /> Inventory
          </NavLinkItem>
          <NavLinkItem to={pb.ipPools()}>
            <IpGlobal16Icon /> IP Pools
          </NavLinkItem>
          <NavLinkItem to={pb.systemUpdate()}>
            <SoftwareUpdate16Icon /> System Update
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}
