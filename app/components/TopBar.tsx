/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useApiMutation } from '@oxide/api'
import {
  DirectionDownIcon,
  Info16Icon,
  Profile16Icon,
} from '@oxide/design-system/icons/react'

import { navToLogin } from '~/api/nav-to-login'
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
      <div className="z-topBar border-b bg-default border-secondary">
        <div className="mx-3 flex h-[60px] shrink-0 items-center justify-between">
          <div className="flex items-center">{otherPickers}</div>
          <div>
            <a
              id="topbar-info-link"
              href="https://docs.oxide.computer/guides"
              target="_blank"
              rel="noreferrer"
              aria-label="Link to documentation"
              className={buttonStyle({ size: 'icon', variant: 'secondary' })}
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
                  className="ml-2"
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
                    Sign out
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
    </>
  )
}
