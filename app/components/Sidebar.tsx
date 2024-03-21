/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Dialog from '@radix-ui/react-dialog'
import { animated, useTransition } from '@react-spring/web'
import cn from 'classnames'
import { NavLink, useLocation } from 'react-router-dom'

import {
  Action16Icon,
  Document16Icon,
  Key16Icon,
  Profile16Icon,
} from '@oxide/design-system/icons/react'

import { navToLogin, useApiMutation } from '~/api'
import { openQuickActions } from '~/hooks'
import { closeSidebar, useMenuState } from '~/hooks/use-menu-state'
import { useCurrentUser } from '~/layouts/AuthenticatedLayout'
import { Button } from '~/ui/lib/Button'
import { Divider } from '~/ui/lib/Divider'
import { Truncate } from '~/ui/lib/Truncate'
import { pb } from '~/util/path-builder'

const linkStyles =
  'flex h-7 items-center rounded px-2 text-sans-md hover:bg-hover svg:mr-2 svg:text-quinary text-secondary'

// TODO: this probably doesn't go to the docs root. maybe it even opens a
// menu with links to several relevant docs for the page
export const DocsLinkItem = () => (
  <li>
    <a
      className={linkStyles}
      href="https://docs.oxide.computer"
      target="_blank"
      rel="noreferrer"
    >
      <Document16Icon /> Docs
    </a>
  </li>
)

// this is mousetrap's logic for the `mod` modifier shortcut
// https://github.com/ccampbell/mousetrap/blob/2f9a476b/mousetrap.js#L135
const modKey = /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'cmd' : 'ctrl'

const JumpToButton = () => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openQuickActions}
      className="w-full !px-2"
      // TODO: the more I use innerClassName the wronger it feels
      innerClassName="w-full justify-between text-quaternary"
    >
      <span className="flex items-center">
        <Action16Icon className="mr-2 text-quinary" /> Jump to
      </span>
      <div className="text-mono-xs">{modKey}+K</div>
    </Button>
  )
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const AnimatedDialogContent = animated(Dialog.Content)
  const { isOpen, isSmallScreen } = useMenuState()
  const config = { tension: 1200, mass: 0.125 }
  const { pathname } = useLocation()

  const transitions = useTransition(isOpen, {
    from: { x: -50 },
    enter: { x: 0 },
    config: isOpen ? config : { duration: 0 },
  })

  const SidebarContent = () => (
    <>
      <div className="mx-3 mt-4">
        <JumpToButton />
      </div>
      {children}
      {pathname.split('/')[1] !== 'settings' && <ProfileLinks />}
    </>
  )

  if (isSmallScreen) {
    return (
      <>
        {transitions(
          ({ x }, item) =>
            item && (
              <Dialog.Root
                open
                onOpenChange={(open) => {
                  if (!open) closeSidebar()
                }}
                // Modal needs to be false to be able to click on top bar
                modal={false}
              >
                <div
                  aria-hidden
                  className="fixed inset-0 top-[61px] z-10 overflow-auto bg-scrim lg+:hidden"
                />
                <AnimatedDialogContent
                  className="fixed z-sideModal flex h-full w-[14.25rem] flex-col border-r text-sans-md text-default border-secondary lg+:!transform-none lg-:inset-y-0 lg-:top-[61px] lg-:bg-default lg-:elevation-2"
                  style={{
                    transform: x.to((value) => `translate3d(${value}%, 0px, 0px)`),
                  }}
                  forceMount
                  onInteractOutside={(e) => {
                    // We want to handle opening / closing with the menu button ourselves
                    // Not doing this can result in the two events fighting
                    if ((e.target as HTMLElement)?.title === 'Sidebar') {
                      e.preventDefault()
                      e.stopPropagation()
                      return null
                    }
                  }}
                >
                  <SidebarContent />
                </AnimatedDialogContent>
              </Dialog.Root>
            )
        )}
      </>
    )
  } else {
    return (
      <div className="fixed z-sideModal flex h-full w-[14.25rem] flex-col border-r text-sans-md text-default border-secondary lg+:!transform-none lg-:inset-y-0 lg-:top-[61px] lg-:bg-default lg-:elevation-2">
        <SidebarContent />
      </div>
    )
  }
}

export const ProfileLinks = () => {
  const { me } = useCurrentUser()

  const logout = useApiMutation('logout', {
    onSuccess: () => {
      // server will respond to /login with a login redirect
      // TODO-usability: do we just want to dump them back to login or is there
      // another page that would make sense, like a logged out homepage
      navToLogin({ includeCurrent: false })
    },
  })

  return (
    <div className="lg+:hidden">
      <Divider />
      <Sidebar.Nav heading={me.displayName || 'User'}>
        <NavLinkItem to={pb.profile()}>
          <Profile16Icon />
          Profile
        </NavLinkItem>
        <NavLinkItem to={pb.sshKeys()}>
          <Key16Icon /> SSH Keys
        </NavLinkItem>
        <NavButtonItem onClick={() => logout.mutate({})}>
          <SignOut16Icon /> Sign out
        </NavButtonItem>
      </Sidebar.Nav>
    </div>
  )
}

const SignOut16Icon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.25 2H3.25H2.75C2.33579 2 2 2.33579 2 2.75V3.25V12V13.25C2 13.6642 2.33579 14 2.75 14H4H7.25C7.66421 14 8 13.6642 8 13.25V12.75C8 12.3358 7.66421 12 7.25 12H4V4H7.25C7.66421 4 8 3.66421 8 3.25V2.75C8 2.33579 7.66421 2 7.25 2ZM13 7.75V8.25C13 8.66421 12.6642 9 12.25 9H7.75C7.33579 9 7 8.66421 7 8.25V7.75C7 7.33579 7.33579 7 7.75 7H12.25C12.6642 7 13 7.33579 13 7.75Z"
      fill="currentColor"
    />
    <rect
      width="4"
      height="5"
      rx="0.75"
      transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 11 10)"
      fill="currentColor"
    />
    <path
      d="M14.2679 8.58565C14.6432 8.2854 14.6432 7.71459 14.2679 7.41434L10.6093 4.48741C10.3637 4.29098 10 4.46579 10 4.78023L10 11.2198C10 11.5342 10.3637 11.709 10.6093 11.5126L14.2679 8.58565Z"
      fill="currentColor"
    />
  </svg>
)

interface SidebarNav {
  children: React.ReactNode
  heading?: string
}

Sidebar.Nav = ({ children, heading }: SidebarNav) => (
  <div className="mx-3 my-4 space-y-1">
    {heading && (
      <div className="mb-2 text-mono-sm text-quaternary">
        <Truncate text={heading} maxLength={24} />
      </div>
    )}
    <nav>
      <ul className="space-y-0.5">{children}</ul>
    </nav>
  </div>
)

export const NavLinkItem = (props: {
  to: string
  children: React.ReactNode
  end?: boolean
  disabled?: boolean
}) => {
  // If the current page is the create form for this NavLinkItem's resource, highlight the NavLink in the sidebar
  const currentPathIsCreateForm = useLocation().pathname.startsWith(`${props.to}-new`)
  return (
    <li>
      <NavLink
        to={props.to}
        className={({ isActive }) =>
          cn(linkStyles, {
            'text-accent !bg-accent-secondary hover:!bg-accent-secondary-hover svg:!text-accent-tertiary':
              isActive || currentPathIsCreateForm,
            'pointer-events-none text-disabled': props.disabled,
          })
        }
        end={props.end}
      >
        {props.children}
      </NavLink>
    </li>
  )
}

export const NavButtonItem = (props: {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}) => (
  <li>
    <button
      onClick={props.onClick}
      className={cn(
        linkStyles,
        {
          'pointer-events-none text-disabled': props.disabled,
        },
        'w-full'
      )}
    >
      {props.children}
    </button>
  </li>
)
