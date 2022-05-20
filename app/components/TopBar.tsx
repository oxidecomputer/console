import { navToLogin, useApiQuery, useApiMutation } from '@oxide/api'
import {
  Button,
  Profile16Icon,
  DirectionDownIcon,
  Notifications16Icon,
  Info16Icon,
} from '@oxide/ui'

import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { useSearchParams } from 'react-router-dom'

export function TopBar() {
  const [searchParams, setSearchParams] = useSearchParams()
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
    <div className="flex h-10 items-center justify-end">
      <Button variant="link" size="xs" className="-mr-1 !text-tertiary">
        <Info16Icon />
      </Button>
      <Button variant="link" size="xs" className="!text-tertiary">
        <Notifications16Icon />
      </Button>
      <Menu>
        <MenuButton aria-label="User menu" className="ml-1 text-tertiary">
          <Profile16Icon /> <DirectionDownIcon className="!w-2.5" />
        </MenuButton>
        <MenuList>
          <MenuItem
            onSelect={() => {
              searchParams.set('settings', 'profile')
              setSearchParams(searchParams, { replace: true })
            }}
          >
            User settings
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
