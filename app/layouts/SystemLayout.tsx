import { Outlet } from 'react-router-dom'

import { Pagination } from '@oxide/pagination'
import {
  Divider,
  Health16Icon,
  Instances16Icon,
  Networking16Icon,
  Settings16Icon,
  SkipLinkTarget,
  Snapshots16Icon,
  SoftwareUpdate16Icon,
  Storage16Icon,
} from '@oxide/ui'

import { PageActionsTarget } from 'app/components/PageActions'
import { DocsLink, JumpToButton, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { SiloSystemPicker } from 'app/components/TopBarPicker'

import { TopBar } from '../components/TopBar'
import {
  ContentPane,
  ContentPaneActions,
  ContentPaneWrapper,
  PageContainer,
} from './helpers'

export default function SiloLayout() {
  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Header>
          <SiloSystemPicker />
        </Sidebar.Header>
        <div className="mx-3 mt-4">
          {/* TODO: click should open jump to menu */}
          <JumpToButton onClick={() => {}} />
        </div>
        <Sidebar.Nav>
          <li>
            <DocsLink />
          </li>
        </Sidebar.Nav>
        <Divider />
        {/* TODO: silo name in heading */}
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
      </Sidebar>
      <ContentPaneWrapper>
        <ContentPane>
          <TopBar />
          <SkipLinkTarget />
          <div className="[&>*]:gutter">
            <Outlet />
          </div>
        </ContentPane>
        <ContentPaneActions>
          <Pagination.Target />
          <PageActionsTarget />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}
