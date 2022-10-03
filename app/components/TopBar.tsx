import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { navToLogin, useApiMutation, useApiQuery } from '@oxide/api'
import {
  Button,
  DirectionDownIcon,
  Info16Icon,
  Notifications16Icon,
  Profile16Icon,
} from '@oxide/ui'
import { isTruthy } from '@oxide/util'

import { pb } from 'app/util/path-builder'

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

  const isSystem = useLocation().pathname.startsWith(pb.system()) // lol
  const { projectName } = useParams()

  const [cornerPicker, ...otherPickers] = [
    hasSiloPerms && <SiloSystemPicker isSystem={isSystem} key={0} />,
    // TODO: This works ok in most situations, but when an operator user is on
    // the orgs page with no org selected, they see this picker, which is
    // redundant with the list of orgs. Overall this logic is starting to feel
    // silly, which points to a non-centralized approach handled in the layouts
    // like we were doing before. That way, for example, we know whether we're
    // on a system situation because we're in SystemLayout. Seems pretty obvious
    // in hindsight.
    !isSystem && <OrgPicker key={1} />,
    projectName && <ProjectPicker key={2} />,
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
                <span className="normal-case text-sans-sm">
                  {user?.displayName || 'User'}
                </span>
                <DirectionDownIcon className="!w-2.5" />
              </MenuButton>
              <MenuList className="mt-2">
                <MenuItem onSelect={() => navigate(pb.settings())}>Settings</MenuItem>
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
