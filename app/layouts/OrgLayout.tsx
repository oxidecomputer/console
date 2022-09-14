import { Outlet } from 'react-router-dom'

import { Pagination } from '@oxide/pagination'
import { Divider, Organization16Icon, SkipLinkTarget } from '@oxide/ui'

import { PageActionsTarget } from 'app/components/PageActions'

import { DocsLink, JumpToButton, NavLinkItem, Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'
import { useRequiredParams } from '../hooks'
import {
  ContentPane,
  ContentPaneActions,
  ContentPaneWrapper,
  PageContainer,
} from './helpers'

// We need to use absolute paths here because sometimes this layout is rendered
// at `/orgs/:orgName` and other times it's rendered at `/orgs/:orgName/access`.
// Relative paths would resolve differently in the two locations.

const OrgLayout = () => {
  const { orgName } = useRequiredParams('orgName')

  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Header>
          <div className="text-mono-sm text-tertiary">Silo</div>
          <div className="text-sans-sm text-secondary">console.bitmapbros.com</div>
        </Sidebar.Header>
        <div className="mx-3 mt-4">
          {/* TODO: click should open jump to menu */}
          <JumpToButton onClick={() => {}} />
        </div>
        <Sidebar.Nav>
          <NavLinkItem to="/orgs" end>
            <Organization16Icon />
            Organizations
          </NavLinkItem>
          <li>
            {/* TODO: this probably doesn't just go to the docs root. maybe it even opens
                a menu with links to several relevant docs */}
            <DocsLink />
          </li>
        </Sidebar.Nav>
        <Divider />
        <Sidebar.Nav heading={orgName}>
          <NavLinkItem to={`/orgs/${orgName}/projects`}>Projects</NavLinkItem>
          <NavLinkItem to={`/orgs/${orgName}/access`}>Access &amp; IAM</NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPaneWrapper>
        <ContentPane>
          <TopBar />
          <SkipLinkTarget />
          <Outlet />
        </ContentPane>
        <ContentPaneActions>
          <Pagination.Target />
          <PageActionsTarget />
        </ContentPaneActions>
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default OrgLayout
