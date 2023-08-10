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
  Divider,
  Settings16Icon,
  Snapshots16Icon,
  Storage16Icon,
} from '@oxide/ui'

import { trigger404 } from 'app/components/ErrorBoundary'
import { DocsLinkItem, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { TopBar } from 'app/components/TopBar'
import { SiloPicker, SiloSystemPicker } from 'app/components/TopBarPicker'
import { useQuickActions } from 'app/hooks'
import { pb } from 'app/util/path-builder'

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

export default function SystemLayout() {
  // Only show silo picker if we are looking at a particular silo. The more
  // robust way of doing this would be to make a separate layout for the
  // silo-specific routes in the route config, but it's overkill considering
  // this is a one-liner. Switch to that approach at the first sign of trouble.
  const { silo } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const { me } = useCurrentUser()

  const actions = useMemo(() => {
    const systemLinks = [
      { value: 'Silos', path: pb.silos() },
      { value: 'Utilization', path: pb.systemUtilization() },
      { value: 'Inventory', path: pb.sledInventory() },
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
            <Snapshots16Icon /> Utilization
          </NavLinkItem>
          <NavLinkItem to={pb.sledInventory()}>
            <Storage16Icon /> Inventory
          </NavLinkItem>
          {/* <NavLinkItem to={pb.systemHealth()} disabled>
            <Health16Icon /> Health
          </NavLinkItem>
          <NavLinkItem to={pb.systemUpdates()} disabled>
            <SoftwareUpdate16Icon /> System Update
          </NavLinkItem>
          <NavLinkItem to={pb.systemNetworking()} disabled>
            <Networking16Icon /> Networking
          </NavLinkItem> */}
          <NavLinkItem to={pb.systemSettings()} disabled>
            <Settings16Icon /> Settings
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}
