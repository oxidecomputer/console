/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { navToLogin, useApiMutation } from '@oxide/api'
import {
  DirectionDownIcon,
  Info16Icon,
  MenuClose12Icon,
  MenuOpen12Icon,
  Profile16Icon,
} from '@oxide/design-system/icons/react'

import { closeSidebar, openSidebar, useMenuState } from '~/hooks/use-menu-state'
import { useCurrentUser } from '~/layouts/AuthenticatedLayout'
import { Button, buttonStyle } from '~/ui/lib/Button'
import { DropdownMenu } from '~/ui/lib/DropdownMenu'
import { pb } from '~/util/path-builder'

export function TopBar({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const logout = useApiMutation('logout', {
    onSuccess: () => navToLogin({ includeCurrent: false }),
  })
  // fetch happens in loader wrapping all authed pages
  const { me } = useCurrentUser()

  const loggedIn = !!me

  // toArray filters out nulls, which is essential because the silo/system
  // picker is going to come in null when the user isn't supposed to see it
  const [cornerPicker, ...otherPickers] = React.Children.toArray(children)

  const { isOpen } = useMenuState()

  return (
    <div className="fixed top-0 z-topBar col-span-2 grid h-[var(--navigation-height)] w-full grid-cols-[min-content,auto] bg-default lg+:grid-cols-[var(--sidebar-width),auto]">
      <div className="flex items-center border-b pl-3 border-secondary lg+:border-r lg+:pr-3">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 w-8 shrink-0 lg+:hidden [&>*]:pointer-events-none"
          title="Sidebar"
          onClick={() => {
            if (isOpen) {
              closeSidebar()
            } else {
              openSidebar()
            }
          }}
        >
          {isOpen ? (
            <MenuClose12Icon className="text-tertiary" />
          ) : (
            <MenuOpen12Icon className="text-tertiary" />
          )}
        </Button>

        {cornerPicker}
      </div>

      <div className="border-b bg-default border-secondary">
        <div className="mr-3 flex h-[var(--navigation-height)] shrink-0 items-center justify-between lg+:ml-3">
          <div className="pickers before:text-mono-lg flex items-center before:children:content-['/'] before:children:first:mx-3 before:children:first:text-quinary md-:children:hidden lg+:[&>div:first-of-type]:before:hidden md-:[&>div:last-of-type]:flex">
            {otherPickers}
          </div>
          <div>
            <a
              id="topbar-info-link"
              href="https://docs.oxide.computer/guides"
              target="_blank"
              rel="noreferrer"
              aria-label="Link to documentation"
              className={cn(
                buttonStyle({ size: 'icon', variant: 'secondary' }),
                'md-:hidden'
              )}
            >
              <Info16Icon className="text-quaternary" />
            </a>
            {/* <Button variant="secondary" size="icon" className="ml-2" title="Notifications">
              <Notifications16Icon className="text-quaternary" />
            </Button> */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  aria-label="User menu"
                  className="ml-2 md-:hidden"
                  innerClassName="space-x-2"
                >
                  <Profile16Icon className="text-quaternary" />
                  <span className="normal-case text-sans-md text-secondary">
                    {me.displayName || 'User'}
                  </span>
                  <DirectionDownIcon className="!w-2.5" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="min-w-[12.8125rem]"
              >
                <DropdownMenu.Item onSelect={() => navigate(pb.profile())}>
                  Settings
                </DropdownMenu.Item>
                {loggedIn ? (
                  <DropdownMenu.Item onSelect={() => logout.mutate({})}>
                    Sign Out
                  </DropdownMenu.Item>
                ) : (
                  <DropdownMenu.Item onSelect={() => navToLogin({ includeCurrent: true })}>
                    Sign In
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </div>
  )
}
