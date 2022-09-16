import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { useNavigate } from 'react-router-dom'

import { navToLogin, useApiMutation, useApiQuery } from '@oxide/api'
import {
  Button,
  DirectionDownIcon,
  Info16Icon,
  Notifications16Icon,
  Profile16Icon,
} from '@oxide/ui'

export function TopBar({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate()
  const logout = useApiMutation('logout', {
    onSuccess: () => {
      // server will respond to /login with a login redirect
      // TODO-usability: do we just want to dump them back to login or is there
      // another page that would make sense, like a logged out homepage
      navToLogin({ includeCurrent: false })
    },
  })
  const { data: user, error } = useApiQuery(
    'sessionMe',
    {},
    { cacheTime: 0, refetchOnWindowFocus: false }
  )

  const loggedIn = user && !error

  return (
    // shrink-0 is needed to prevent getting squished by body content
    <div className="sticky top-0 h-[60px] border-b border-secondary bg-default">
      <div className="flex shrink-0 h-[60px] items-center justify-between mx-3">
        <div className="flex items-center">{children}</div>
        <div>
          <Button variant="default" color="secondary" size="xs" title="Info">
            <Info16Icon />
          </Button>
          <Button color="secondary" size="xs" className="ml-2" title="Notifications">
            <Notifications16Icon />
          </Button>
          <Menu>
            <MenuButton
              as={Button}
              color="secondary"
              size="xs"
              aria-label="User menu"
              className="ml-2"
              innerClassName="space-x-2"
              title="User menu"
            >
              <Profile16Icon />
              {/* TODO: design has this in sans font but button forces mono */}
              {/* TODO: the name pops in — use a loader to hold up the whole page instead? */}
              <span>{user?.displayName || 'User'}</span>
              <DirectionDownIcon className="!w-2.5" />
            </MenuButton>
            <MenuList className="mt-2">
              <MenuItem
                onSelect={() => {
                  navigate('/settings')
                }}
              >
                Settings
              </MenuItem>
              {loggedIn ? (
                <MenuItem onSelect={() => logout.mutate({})}>Sign out</MenuItem>
              ) : (
                <MenuItem onSelect={() => navToLogin({ includeCurrent: true })}>
                  Sign In
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </div>
      </div>
    </div>
  )
}
