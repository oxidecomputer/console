import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { navToLogin, useApiMutation, useApiQuery } from '@oxide/api'
import {
  Button,
  DirectionDownIcon,
  Info16Icon,
  Notifications16Icon,
  Profile16Icon,
} from '@oxide/ui'

import { pb2 } from 'app/util/path-builder'

export function TopBar({ children }: { children: React.ReactNode }) {
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

  const loggedIn = !!user

  // toArray filters out nulls, which is essential because the silo/system
  // picker is going to come in null when the user isn't supposed to see it
  const [cornerPicker, ...otherPickers] = React.Children.toArray(children)

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
            <Button variant="secondary" size="icon" title="Info">
              <Info16Icon className="text-quaternary" />
            </Button>
            <Button variant="secondary" size="icon" className="ml-2" title="Notifications">
              <Notifications16Icon className="text-quaternary" />
            </Button>
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                variant="secondary"
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
                <MenuItem onSelect={() => navigate(pb2.settings())}>Settings</MenuItem>
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
