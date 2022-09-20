import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { useNavigate, useParams } from 'react-router-dom'

import { navToLogin, useApiMutation, useApiQuery } from '@oxide/api'
import {
  Button,
  DirectionDownIcon,
  Info16Icon,
  Notifications16Icon,
  Profile16Icon,
} from '@oxide/ui'
import { isTruthy } from '@oxide/util'

import { OrgPicker, ProjectPicker, SiloSystemPicker } from './TopBarPicker'

/**
 * TODO: This is a temporary flag to disable the silo picker until we have
 * the an API endpoint to support it.
 */
const hasSiloPerms = true

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

  const { orgName, projectName } = useParams()

  const [cornerPicker, ...otherPickers] = [
    hasSiloPerms && <SiloSystemPicker />,
    orgName && <OrgPicker />,
    projectName && <ProjectPicker />,
  ].filter(isTruthy)

  // The height of this component is governed by the `PageContainer`
  // It's important that this component returns two distinct elements (wrapped in a fragment).
  // Each element will occupy one of the top column slots provided by `PageContainer`.
  return (
    <>
      <div className="flex border-b border-r px-3 border-secondary">{cornerPicker}</div>
      {/* Height is governed by PageContainer grid */}
      {/* shrink-0 is needed to prevent getting squished by body content */}
      <div className="border-b bg-default border-secondary">
        <div className="mx-3 flex h-[60px] shrink-0 items-center justify-between">
          <div className="flex items-center between:before:mx-4 between:before:content-['/'] between:before:text-mono-lg between:before:text-tertiary">
            {otherPickers}
          </div>
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
    </>
  )
}
