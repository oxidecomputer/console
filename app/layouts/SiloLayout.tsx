import {
  Access16Icon,
  Divider,
  Folder16Icon,
  Images16Icon,
  Snapshots16Icon,
} from '@oxide/ui'

import { DocsLinkItem, NavLinkItem, Sidebar } from 'app/components/Sidebar'
import { TopBar } from 'app/components/TopBar'
import { ProjectPicker, SiloSystemPicker } from 'app/components/TopBarPicker'
import { pb } from 'app/util/path-builder'

import { ContentPane, PageContainer } from './helpers'

export default function SiloLayout() {
  return (
    <PageContainer>
      <TopBar>
        <SiloSystemPicker value="silo" />
        <ProjectPicker />
      </TopBar>
      <Sidebar>
        <Sidebar.Nav>
          <DocsLinkItem />
        </Sidebar.Nav>
        <Divider />
        {/* TODO: silo name in heading */}
        <Sidebar.Nav heading="Silo">
          <NavLinkItem to={pb.projects()}>
            <Folder16Icon /> Projects
          </NavLinkItem>
          <NavLinkItem to={pb.siloImages()}>
            <Images16Icon /> Images
          </NavLinkItem>
          <NavLinkItem to={pb.siloUtilization()}>
            <Snapshots16Icon /> Utilization
          </NavLinkItem>
          <NavLinkItem to={pb.siloAccess()}>
            <Access16Icon /> Access & IAM
          </NavLinkItem>
          <NavLinkItem to={pb.siloImages()}>
            <Images16Icon /> Images
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}
