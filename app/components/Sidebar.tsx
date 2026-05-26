/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { Link, useLocation } from 'react-router'

import { api, navToLogin, useApiMutation } from '@oxide/api'
import {
  Action16Icon,
  Document16Icon,
  Key16Icon,
  Profile16Icon,
  SignOut16Icon,
} from '@oxide/design-system/icons/react'

import { useIsActivePath } from '~/hooks/use-is-active-path'
import { closeSidebar, useMenuState } from '~/hooks/use-menu-state'
import { openQuickActions } from '~/hooks/use-quick-actions'
import { sidebarWrapperClass } from '~/layouts/helpers'
import { Button } from '~/ui/lib/Button'
import { Divider } from '~/ui/lib/Divider'
import { Truncate } from '~/ui/lib/Truncate'
import { pb } from '~/util/path-builder'

const linkStyles = (isActive = false) =>
  cn(
    'flex h-7 items-center rounded-md px-2 text-sans-md [&>svg]:mr-2',
    isActive
      ? 'text-accent bg-accent hover:bg-accent-hover [&>svg]:text-accent-tertiary'
      : 'hover:bg-hover [&>svg]:text-quaternary text-default'
  )

// TODO: this probably doesn't go to the docs root. maybe it even opens a
// menu with links to several relevant docs for the page
export const DocsLinkItem = () => (
  <li>
    <a
      className={linkStyles()}
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
      className="w-full px-2!"
      // TODO: the more I use innerClassName the wronger it feels
      innerClassName="w-full justify-between text-tertiary"
    >
      <span className="flex items-center">
        <Action16Icon className="text-quaternary mr-2" /> Jump to
      </span>
      <div className="text-mono-xs">{modKey}+K</div>
    </Button>
  )
}

/** Profile, SSH Keys, and Sign Out links shown in the mobile sidebar */
export function ProfileLinks({ className }: { className?: string }) {
  const logout = useApiMutation(api.logout, {
    onSuccess: () => navToLogin({ includeCurrent: false }),
  })
  return (
    <div className={cn('mx-3 my-4 space-y-1', className)}>
      <div className="text-mono-sm text-tertiary mb-2">User</div>
      <nav aria-label="User navigation">
        <ul className="space-y-px">
          <NavLinkItem to={pb.profile()}>
            <Profile16Icon /> Profile
          </NavLinkItem>
          <NavLinkItem to={pb.sshKeys()}>
            <Key16Icon /> SSH Keys
          </NavLinkItem>
          <li>
            <button
              type="button"
              className={linkStyles()}
              onClick={() => logout.mutate({})}
            >
              <SignOut16Icon /> Sign out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

const sidebarContent = 'text-sans-md text-raise flex flex-col'

type SidebarProps = {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const { isOpen, isSmallScreen } = useMenuState()

  if (isSmallScreen) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Scrim overlay — sits above the top bar so the whole viewport dims */}
            <m.div
              key="scrim"
              className="bg-scrim fixed inset-0 z-(--z-side-modal-overlay)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSidebar}
              aria-hidden
            />
            {/* Drawer */}
            <m.div
              key="drawer"
              className={cn(
                sidebarContent,
                'bg-default border-secondary fixed top-(--top-bar-height) bottom-0 left-0 z-(--z-side-modal) w-(--sidebar-width) overflow-y-auto border-r'
              )}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            >
              <div className="max-1000:hidden mx-3 mt-4">
                <JumpToButton />
              </div>
              {children}
              <Divider />
              <ProfileLinks />
            </m.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div
      className={cn(
        sidebarWrapperClass,
        sidebarContent,
        'max-1000:hidden overflow-y-auto overscroll-none'
      )}
    >
      <div className="mx-3 mt-4">
        <JumpToButton />
      </div>
      {children}
    </div>
  )
}

interface SidebarNav {
  children: React.ReactNode
  heading?: string
}

Sidebar.Nav = ({ children, heading }: SidebarNav) => (
  <div className="mx-3 my-4 space-y-1">
    {heading && (
      <div className="text-mono-sm text-tertiary mb-2">
        <Truncate text={heading} maxLength={24} />
      </div>
    )}
    <nav aria-label="Sidebar navigation">
      <ul className="space-y-px">{children}</ul>
    </nav>
  </div>
)

type NavLinkProps = {
  to: string
  children: React.ReactNode
  end?: boolean
  disabled?: boolean
  // Only for cases where we want to spoof the path and pretend 'isActive'
  activePrefix?: string
}

export const NavLinkItem = ({
  to,
  children,
  end,
  disabled,
  activePrefix,
}: NavLinkProps) => {
  // If the current page is the create form for this NavLinkItem's resource, highlight the NavLink in the sidebar
  const currentPathIsCreateForm = useLocation().pathname.startsWith(`${to}-new`)
  // We aren't using NavLink, as we need to occasionally use an activePrefix to create an active state for matching root paths
  // so we also recreate the isActive logic here
  const isActive = useIsActivePath({ to: activePrefix || to, end })
  return (
    <li>
      <Link
        to={to}
        className={cn(linkStyles(isActive || currentPathIsCreateForm), {
          'text-disabled pointer-events-none': disabled,
        })}
        aria-current={isActive ? 'page' : undefined}
      >
        {children}
      </Link>
    </li>
  )
}
