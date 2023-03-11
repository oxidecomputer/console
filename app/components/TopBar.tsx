import * as Menu from '@radix-ui/react-dropdown-menu'
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

import { pb } from 'app/util/path-builder'

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
          <div className="flex items-center">{otherPickers}</div>
          <div>
            <Button variant="secondary" size="icon" title="Info">
              <Info16Icon className="text-quaternary" />
            </Button>
            <Button variant="secondary" size="icon" className="ml-2" title="Notifications">
              <Notifications16Icon className="text-quaternary" />
            </Button>
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  aria-label="User menu"
                  className="ml-2"
                  innerClassName="space-x-2"
                >
                  <Profile16Icon className="text-quaternary" />
                  <span className="normal-case text-sans-md text-secondary">
                    {user?.displayName || 'User'}
                  </span>
                  <DirectionDownIcon className="!w-2.5" />
                </Button>
              </Menu.Trigger>
              <Menu.Content className="MenuContent" align="end" sideOffset={8}>
                <Menu.Item className="MenuItem" onSelect={() => navigate(pb.settings())}>
                  Settings
                </Menu.Item>
                {loggedIn ? (
                  <Menu.Item className="MenuItem" onSelect={() => logout.mutate({})}>
                    Sign out
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    className="MenuItem"
                    onSelect={() => navToLogin({ includeCurrent: true })}
                  >
                    Sign In
                  </Menu.Item>
                )}
              </Menu.Content>
            </Menu.Root>
          </div>
        </div>
      </div>
    </>
  )
}
