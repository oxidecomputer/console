import { useMemo } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'

import { Divider, Key16Icon, Profile16Icon, Show16Icon } from '@oxide/ui'

import { SiloSystemPicker } from 'app/components/TopBarPicker'
import { useQuickActions } from 'app/hooks'

import { DocsLink, JumpToButton, NavLinkItem, Sidebar } from '../components/Sidebar'
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
        <Sidebar.Header>
          <SiloSystemPicker />
        </Sidebar.Header>
        <div className="flex-grow">
          <div className="mx-3 mt-4">
            {/* TODO: click should open jump to menu */}
            <JumpToButton onClick={() => {}} />
          </div>
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
        </div>
      </Sidebar>
      <ContentPane />
    </PageContainer>
  )
}

export default SettingsLayout
