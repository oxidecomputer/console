import { Access16Icon, Divider, Folder16Icon, Organization16Icon } from '@oxide/ui'

import { OrgPicker } from 'app/components/TopBarPicker'
import { useRequiredParams } from 'app/hooks'

import { DocsLinkItem, NavLinkItem, Sidebar } from '../components/Sidebar'
import { ContentPane, PageContainer } from './helpers'

// We need to use absolute paths here because sometimes this layout is rendered
// at `/orgs/:orgName` and other times it's rendered at `/orgs/:orgName/access`.
// Relative paths would resolve differently in the two locations.

const OrgLayout = () => {
  const { orgName } = useRequiredParams('orgName')

  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Nav>
          <NavLinkItem to="/orgs" end>
            <Organization16Icon />
            Organizations
          </NavLinkItem>
          <DocsLinkItem />
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
      </Sidebar>
      <ContentPane>
        <OrgPicker />
      </ContentPane>
    </PageContainer>
  )
}

export default OrgLayout
