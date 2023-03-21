import { Access16Icon, Divider, Folder16Icon, Organization16Icon } from '@oxide/ui'

import { TopBar } from 'app/components/TopBar'
import { useSiloSystemPicker } from 'app/components/TopBarPicker'
import { useOrgSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { DocsLinkItem, NavLinkItem, Sidebar } from '../components/Sidebar'
import { ContentPane, PageContainer } from './helpers'

const OrgLayout = () => {
  const { organization } = useOrgSelector()

  return (
    <PageContainer>
      <TopBar>{useSiloSystemPicker('silo')}</TopBar>
      <Sidebar>
        <Sidebar.Nav>
          <NavLinkItem to={pb.orgs()} end>
            <Organization16Icon />
            Organizations
          </NavLinkItem>
          <DocsLinkItem />
        </Sidebar.Nav>
        <Divider />
        <Sidebar.Nav heading={organization}>
          <NavLinkItem to={pb.projects()}>
            <Folder16Icon title="Projects" />
            Projects
          </NavLinkItem>
          <NavLinkItem to={pb.orgAccess()}>
            <Access16Icon title="Access & IAM" />
            Access &amp; IAM
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}

export default OrgLayout
