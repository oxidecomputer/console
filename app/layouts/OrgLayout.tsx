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
import { OrgPicker, SiloSystemPicker } from 'app/components/TopBarPicker'
import { useRequiredParams } from 'app/hooks'

import { DocsLink, JumpToButton, NavLinkItem, Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'
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
          <SiloSystemPicker />
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
          <TopBar>
            <OrgPicker />
          </TopBar>
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
