/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import {
  Cloud16Icon,
  IpGlobal16Icon,
  Metrics16Icon,
  Servers16Icon,
} from '@oxide/design-system/icons/react'

import { trigger404 } from '~/components/ErrorBoundary'
import { DocsLinkItem, NavLinkItem, Sidebar } from '~/components/Sidebar'
import { TopBar } from '~/components/TopBar'
import { IpPoolPicker, SiloPicker, SiloSystemPicker } from '~/components/TopBarPicker'
import { useQuickActions } from '~/hooks'
import { Divider } from '~/ui/lib/Divider'
import { pb } from '~/util/path-builder'

import { useCurrentUser } from './AuthenticatedLayout'
import { ContentPane, PageContainer } from './helpers'

/**
 * If we can see the policy, we're a fleet viewer, and we need to be a fleet
 * viewer in order to see any of the routes under this layout. We need to
 * `fetchQuery` instead of `prefetchQuery` because the latter doesn't return the
 * result, and then we need to `.catch()` because `fetchQuery` throws on request
 * error. We're being a little cavalier here with the error. If it's something
 * other than a 403, that would be strange and we would want to know.
 */
SystemLayout.loader = async () => {
  // we don't need to use the ErrorsAllowed version here because we're 404ing
  // immediately on error, so we don't need to pick the result up from the cache
  const isFleetViewer = await apiQueryClient
    .fetchQuery('systemPolicyView', {})
    .then(() => true)
    .catch(() => false)

  // TODO: make sure 404 is the desired behavior. This situation should be
  // pretty unlikely.
  if (!isFleetViewer) throw trigger404

  return null
}

export function SystemLayout() {
  // Only show silo picker if we are looking at a particular silo. The more
  // robust way of doing this would be to make a separate layout for the
  // silo-specific routes in the route config, but it's overkill considering
  // this is a one-liner. Switch to that approach at the first sign of trouble.
  const { silo, pool } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const { me } = useCurrentUser()

  const actions = useMemo(() => {
    const systemLinks = [
      { value: 'Silos', path: pb.silos() },
      { value: 'Utilization', path: pb.systemUtilization() },
      { value: 'Inventory', path: pb.inventory() },
      { value: 'IP Pools', path: pb.ipPools() },
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
      <TopBar>
        <SiloSystemPicker value="system" />
        {silo && <SiloPicker />}
        {pool && <IpPoolPicker />}
      </TopBar>
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
          <NavLinkItem to={pb.inventory()}>
            <Servers16Icon /> Inventory
          </NavLinkItem>
          <NavLinkItem to={pb.ipPools()}>
            <IpGlobal16Icon /> IP Pools
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}
