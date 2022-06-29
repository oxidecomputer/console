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

export function TopBar() {
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
    <div className="flex shrink-0 h-10 items-center justify-end">
      <Button variant="link" size="xs" className="-mr-0.5 !text-tertiary" title="Info">
        <Info16Icon />
      </Button>
      <Button variant="link" size="xs" className="!text-tertiary" title="Notifications">
        <Notifications16Icon />
      </Button>
      <Menu>
        <MenuButton
          aria-label="User menu"
          className="flex ml-1.5 text-tertiary items-center"
          title="User menu"
        >
          {/* span needed to make the button align with the other ones */}
          <span>
            <Profile16Icon /> <DirectionDownIcon className="ml-0.5 !w-2.5" />
          </span>
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
  )
}
