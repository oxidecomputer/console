import { Outlet } from 'react-router-dom'

import { Pagination } from '@oxide/pagination'
import {
  Access16Icon,
  Add12Icon,
  Button,
  Divider,
  Folder16Icon,
  Organization16Icon,
  SkipLinkTarget,
} from '@oxide/ui'

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
        {/* flex-grow pushes footer to the bottom. TODO: is that good */}
        <div className="flex-grow">
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
            {/* TODO: icon for each item */}
            <NavLinkItem to={`/orgs/${orgName}/projects`}>
              <Folder16Icon title="Projects" />
              Projects
            </NavLinkItem>
            <NavLinkItem to={`/orgs/${orgName}/access`}>
              <Access16Icon title="Access & IAM" />
              Access &amp; IAM
            </NavLinkItem>
          </Sidebar.Nav>
        </div>
        <Sidebar.Footer>
          <Button color="secondary" size="xs" className="w-full">
            <Add12Icon className="mr-2" /> New
          </Button>
        </Sidebar.Footer>
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

export default OrgLayout
