import { useMemo } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'

import { Divider, Key16Icon, Profile16Icon, Show16Icon } from '@oxide/ui'

import { useQuickActions } from 'app/hooks'

import { DocsLink, NavLinkItem, Sidebar } from '../components/Sidebar'
import { ContentPane, PageContainer } from './helpers'

const SettingsLayout = () => {
  const navigate = useNavigate()
  const currentPath = useLocation().pathname

  useQuickActions(
    useMemo(
      () =>
        [
          { value: 'Profile', path: 'profile' },
          { value: 'Appearance', path: 'appearance' },
          { value: 'Hotkeys', path: 'hotkeys' },
          { value: 'SSH Keys', path: 'ssh-keys' },
        ]
          // filter out the entry for the path we're currently on
          .filter((i) => !matchPath(`/settings/${i.path}`, currentPath))
          .map((i) => ({
            navGroup: `Settings`,
            value: i.value,
            onSelect: () => navigate(i.path),
          })),
      [currentPath, navigate]
    )
  )

  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Nav>
          {/* TODO: what to link here? anything? */}
          <li>
            <DocsLink />
          </li>
        </Sidebar.Nav>
        <Divider />
        <Sidebar.Nav heading="User">
          <NavLinkItem to="profile">
            <Profile16Icon /> Profile
          </NavLinkItem>
          <NavLinkItem to="appearance">
            <Show16Icon /> Appearance
          </NavLinkItem>
          <NavLinkItem to="hotkeys">
            <Profile16Icon /> Hotkeys
          </NavLinkItem>
          <NavLinkItem to="ssh-keys">
            <Key16Icon /> SSH Keys
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}

export default SettingsLayout
