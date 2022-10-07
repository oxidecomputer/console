import { Divider, Organization16Icon, Snapshots16Icon } from '@oxide/ui'

import { DocsLinkItem, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { TopBar } from 'app/components/TopBar'
import { pb } from 'app/util/path-builder'

import { ContentPane, PageContainer } from './helpers'

export default function SiloLayout() {
  return (
    <PageContainer>
      <TopBar />
      <Sidebar>
        <Sidebar.Nav>
          <DocsLinkItem />
        </Sidebar.Nav>
        <Divider />
        {/* TODO: silo name in heading */}
        <Sidebar.Nav heading="Silo">
          <NavLinkItem to={pb.orgs()}>
            <Organization16Icon /> Organizations
          </NavLinkItem>
          <NavLinkItem to={pb.utilization()}>
            <Snapshots16Icon /> Utilization
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}
