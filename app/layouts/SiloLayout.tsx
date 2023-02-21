import { Access16Icon, Divider, Organization16Icon, Snapshots16Icon } from '@oxide/ui'

import { DocsLinkItem, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { TopBar } from 'app/components/TopBar'
import { OrgPicker, useSiloSystemPicker } from 'app/components/TopBarPicker'
import { pb2 } from 'app/util/path-builder'

import { ContentPane, PageContainer } from './helpers'

export default function SiloLayout() {
  return (
    <PageContainer>
      <TopBar>
        {useSiloSystemPicker('silo')}
        <OrgPicker />
      </TopBar>
      <Sidebar>
        <Sidebar.Nav>
          <DocsLinkItem />
        </Sidebar.Nav>
        <Divider />
        {/* TODO: silo name in heading */}
        <Sidebar.Nav heading="Silo">
          <NavLinkItem to={pb2.orgs()}>
            <Organization16Icon /> Organizations
          </NavLinkItem>
          <NavLinkItem to={pb2.siloUtilization()}>
            <Snapshots16Icon /> Utilization
          </NavLinkItem>
          <NavLinkItem to={pb2.siloAccess()}>
            <Access16Icon /> Access & IAM
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}
