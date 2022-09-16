import { Divider, Organization16Icon } from '@oxide/ui'

import { DocsLink, JumpToButton, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { SiloSystemPicker } from 'app/components/TopBarPicker'

import { ContentPane, PageContainer } from './helpers'

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
      <ContentPane />
    </PageContainer>
  )
}
