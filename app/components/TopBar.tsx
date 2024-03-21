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
  Close12Icon,
  DirectionDownIcon,
  Info16Icon,
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
    onSuccess: () => {
      // server will respond to /login with a login redirect
      // TODO-usability: do we just want to dump them back to login or is there
      // another page that would make sense, like a logged out homepage
      navToLogin({ includeCurrent: false })
    },
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
          className="mr-2 w-8 flex-shrink-0 lg+:hidden [&>*]:pointer-events-none"
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
            <Close12Icon className="text-tertiary" />
          ) : (
            <Menu12Icon className="text-tertiary" />
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

const Menu12Icon = ({ className }: { className: string }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 1.667C1 1.29863 1.29863 1 1.667 1H10.333C10.7014 1 11 1.29863 11 1.667V2.333C11 2.70137 10.7014 3 10.333 3H1.667C1.29863 3 1 2.70137 1 2.333V1.667ZM1 5.667C1 5.29863 1.29863 5 1.667 5H10.333C10.7014 5 11 5.29863 11 5.667V6.333C11 6.70137 10.7014 7 10.333 7H1.667C1.29863 7 1 6.70137 1 6.333V5.667ZM11 9.667C11 9.29863 10.7014 9 10.333 9H1.667C1.29863 9 1 9.29863 1 9.667V10.333C1 10.7014 1.29863 11 1.667 11H10.333C10.7014 11 11 10.7014 11 10.333V9.667Z"
      fill="currentColor"
    />
  </svg>
)
