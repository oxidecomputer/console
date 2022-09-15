import { Outlet } from 'react-router-dom'

import { Pagination } from '@oxide/pagination'
import { Divider, Organization16Icon, SkipLinkTarget } from '@oxide/ui'

import { PageActionsTarget } from 'app/components/PageActions'
import { DocsLink, JumpToButton, NavLinkItem, Sidebar } from 'app/components/Sidebar'

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
          {/* TODO: the actual silo obviously */}
          <div className="text-mono-sm text-tertiary">Silo</div>
          <div className="text-sans-sm text-secondary">console.bitmapbros.com</div>
        </Sidebar.Header>
        <div className="mx-3 mt-4">
          {/* TODO: click should open jump to menu */}
          <JumpToButton onClick={() => {}} />
        </div>
        <Sidebar.Nav>
          {/* TODO: the consistent thing to do here would be to link to the silos
          list, but that's a system level resource so we probably shouldn't do anything */}
          <li>
            {/* TODO: this probably doesn't just go to the docs root. maybe it even opens
                a menu with links to several relevant docs */}
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
