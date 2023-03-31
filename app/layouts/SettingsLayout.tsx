import { useMemo } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'

import { Divider, Key16Icon, Profile16Icon } from '@oxide/ui'

import { TopBar } from 'app/components/TopBar'
import { ProjectPicker, SiloSystemPicker } from 'app/components/TopBarPicker'
import { useQuickActions } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { DocsLinkItem, NavLinkItem, Sidebar } from '../components/Sidebar'
import { ContentPane, PageContainer } from './helpers'

const SettingsLayout = () => {
  const navigate = useNavigate()
  const currentPath = useLocation().pathname

  useQuickActions(
    useMemo(
      () =>
        [
          { value: 'Profile', path: 'profile' },
          { value: 'SSH Keys', path: 'ssh-keys' },
        ]
          // filter out the entry for the path we're currently on
          .filter((i) => !matchPath(`/settings/${i.path}`, currentPath))
          .map((i) => ({
            navGroup: `Settings`,
            value: i.value,
            // TODO: Update this to use the new path builder
            onSelect: () => navigate(i.path),
          })),
      [currentPath, navigate]
    )
  )

  return (
    <PageContainer>
      <TopBar>
        <SiloSystemPicker value="silo" />
        <ProjectPicker />
      </TopBar>
      <Sidebar>
        <Sidebar.Nav>
          {/* TODO: what to link here? anything? */}
          <DocsLinkItem />
        </Sidebar.Nav>
        <Divider />
        <Sidebar.Nav heading="User">
          <NavLinkItem to={pb.profile()}>
            <Profile16Icon /> Profile
          </NavLinkItem>
          <NavLinkItem to={pb.sshKeys()}>
            <Key16Icon /> SSH Keys
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}

export default SettingsLayout
