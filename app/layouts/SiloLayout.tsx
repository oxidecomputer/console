import { Outlet } from 'react-router-dom'

import { Pagination } from '@oxide/pagination'
import { Divider, Organization16Icon, SkipLinkTarget } from '@oxide/ui'

import { PageActionsTarget } from 'app/components/PageActions'
import { DocsLink, JumpToButton, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { SiloSystemPicker } from 'app/components/TopBarPicker'

import { TopBar } from '../components/TopBar'
import {
  Content,
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
        <Sidebar.Nav heading="Silo">
          <NavLinkItem to="/orgs">
            {/* TODO: active green color should apply to icon */}
            <Organization16Icon /> Organizations
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPaneWrapper>
        <ContentPane>
          <TopBar />
          <SkipLinkTarget />
          <Content>
            <Outlet />
          </Content>
        </ContentPane>
        <ContentPaneActions>
          <Pagination.Target />
          <PageActionsTarget />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}
