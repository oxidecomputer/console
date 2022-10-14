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
  const { data: user } = useApiQuery('sessionMe', {}, { cacheTime: 0 })
  const { data: systemPolicy } = useApiQuery('systemPolicyView', {})

  const loggedIn = !!user

  // Whether the user is shown /system/* routes is governed by whether they have
  // viewer perms (or better) on the fleet. The natural place to look for that
  // is the fleet policy, but if the user doesn't have fleet read, they will get
  // a 403 from that endpoint. So we simply check whether that endpoint 200s or
  // not to determine whether the user is a fleet viewer.
  //
  // Note that we are able to ignore the possibility of `systemPolicy` being
  // undefined because the request is still going because we have prefetched
  // this request in the loader. If that prefetch were removed, fleet viewers
  // would see the silo picker pop in when the request resolves. Bad.
  const isFleetViewer = !!systemPolicy

  const isSystem = useLocation().pathname.startsWith(pb.system()) // lol

  const { projectName } = useParams()

  const [cornerPicker, ...otherPickers] = [
    isFleetViewer && <SiloSystemPicker isSystem={isSystem} key={0} />,
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
      <div className="flex items-center border-b border-r px-3 border-secondary">
        {cornerPicker}
      </div>
      {/* Height is governed by PageContainer grid */}
      {/* shrink-0 is needed to prevent getting squished by body content */}
      <div className="border-b bg-default border-secondary">
        <div className="mx-3 flex h-[60px] shrink-0 items-center justify-between">
          <div className="between:before:text-mono-lg flex items-center between:before:mx-4 between:before:content-['/'] between:before:text-quinary">
            {otherPickers}
          </div>
          <div>
            <Button variant="default" color="secondary" size="sm" title="Info">
              <Info16Icon className="text-quaternary" />
            </Button>
            <Button color="secondary" size="sm" className="ml-2" title="Notifications">
              <Notifications16Icon className="text-quaternary" />
            </Button>
            <Menu>
              <MenuButton
                as={Button}
                color="secondary"
                size="sm"
                aria-label="User menu"
                className="ml-2"
                innerClassName="space-x-2"
                title="User menu"
              >
                <Profile16Icon className="text-quaternary" />
                {/* TODO: the name pops in — use a loader to hold up the whole page instead? */}
                <span className="normal-case text-sans-md text-secondary">
                  {user?.displayName || 'User'}
                </span>
                <DirectionDownIcon className="!w-2.5" />
              </MenuButton>
              <MenuList className="mt-2 min-w-[12.8125rem]">
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
