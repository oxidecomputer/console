import { Divider, Organization16Icon } from '@oxide/ui'

import { DocsLink, NavLinkItem, Sidebar } from 'app/components/Sidebar'

import { ContentPane, PageContainer } from './helpers'

export default function SiloLayout() {
  return (
    <PageContainer>
      <Sidebar>
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
      <ContentPane />
    </PageContainer>
  )
}
