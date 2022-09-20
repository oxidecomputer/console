import { Divider, Organization16Icon } from '@oxide/ui'

import { DocsLinkItem, NavLinkItem, Sidebar } from 'app/components/Sidebar'

import { Layout } from './helpers'

export default function SiloLayout() {
  return (
    <Layout>
      <Sidebar.Nav>
        <DocsLinkItem />
      </Sidebar.Nav>
      <Divider />
      {/* TODO: silo name in heading */}
      <Sidebar.Nav heading="Silo">
        <NavLinkItem to="/orgs">
          <Organization16Icon /> Organizations
        </NavLinkItem>
      </Sidebar.Nav>
    </Layout>
  )
}
