import { useParams } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import {
  Cloud16Icon,
  Divider,
  Health16Icon,
  Instances16Icon,
  Networking16Icon,
  Settings16Icon,
  Snapshots16Icon,
  SoftwareUpdate16Icon,
  Storage16Icon,
} from '@oxide/ui'

import { trigger404 } from 'app/components/ErrorBoundary'
import { DocsLinkItem, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { TopBar } from 'app/components/TopBar'
import { SiloPicker, SiloSystemPicker } from 'app/components/TopBarPicker'
import { pb } from 'app/util/path-builder'

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
  const { siloName } = useParams()
  return (
    <PageContainer>
      <TopBar>
        <SiloSystemPicker value="system" />
        {siloName && <SiloPicker />}
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
          <NavLinkItem to={pb.systemIssues()}>
            <Instances16Icon /> Issues
          </NavLinkItem>
          <NavLinkItem to={pb.systemUtilization()}>
            <Snapshots16Icon /> Utilization
          </NavLinkItem>
          <NavLinkItem to={pb.inventory()}>
            <Storage16Icon /> Inventory
          </NavLinkItem>
          <NavLinkItem to={pb.systemHealth()}>
            <Health16Icon /> Health
          </NavLinkItem>
          <NavLinkItem to={pb.systemUpdate()}>
            <SoftwareUpdate16Icon /> System Update
          </NavLinkItem>
          <NavLinkItem to={pb.systemNetworking()}>
            <Networking16Icon /> Networking
          </NavLinkItem>
          <NavLinkItem to={pb.systemSettings()}>
            <Settings16Icon /> Settings
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}
