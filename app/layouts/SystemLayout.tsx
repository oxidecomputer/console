import {
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

import { Layout } from './helpers'

export default function SiloLayout() {
  return (
    <Layout>
      <Sidebar.Nav>
        <DocsLinkItem />
      </Sidebar.Nav>
      <Divider />
      <Sidebar.Nav heading="System">
        <NavLinkItem to="issues">
          {/* TODO: active green color should apply to icon */}
          <Instances16Icon /> Issues
        </NavLinkItem>
        <NavLinkItem to="utilization">
          <Snapshots16Icon /> Utilization
        </NavLinkItem>
        <NavLinkItem to="inventory">
          <Storage16Icon /> Inventory
        </NavLinkItem>
        <NavLinkItem to="health">
          <Health16Icon /> Health
        </NavLinkItem>
        <NavLinkItem to="update">
          <SoftwareUpdate16Icon /> System Update
        </NavLinkItem>
        <NavLinkItem to="networking">
          <Networking16Icon /> Networking
        </NavLinkItem>
        <NavLinkItem to="settings">
          <Settings16Icon /> Settings
        </NavLinkItem>
      </Sidebar.Nav>
    </Layout>
  )
}
