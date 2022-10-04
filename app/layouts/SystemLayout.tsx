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

import { DocsLinkItem, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { TopBar } from 'app/components/TopBar'
import { pb } from 'app/util/path-builder'

import { ContentPane, PageContainer } from './helpers'

export default function SiloLayout() {
  return (
    <PageContainer>
      <TopBar />
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
            {/* TODO: active green color should apply to icon */}
            <Instances16Icon /> Issues
          </NavLinkItem>
          <NavLinkItem to={pb.systemUtilization()}>
            <Snapshots16Icon /> Utilization
          </NavLinkItem>
          <NavLinkItem to={pb.systemInventory()}>
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
