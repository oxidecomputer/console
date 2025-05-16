/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { Link, useLocation } from 'react-router'

import { Action16Icon, Document16Icon } from '@oxide/design-system/icons/react'

import { useIsActivePath } from '~/hooks/use-is-active-path'
import { openQuickActions } from '~/hooks/use-quick-actions'
import { Button } from '~/ui/lib/Button'
import { Truncate } from '~/ui/lib/Truncate'

const linkStyles = (isActive: boolean) =>
  cn(
    'flex h-7 items-center rounded px-2 text-sans-md [&>svg]:mr-2',
    isActive
      ? 'text-accent bg-accent-secondary hover:bg-accent-secondary-hover [&>svg]:text-accent-tertiary!'
      : '[&>svg]:text-quaternary text-default hover:bg-hover'
  )

// TODO: this probably doesn't go to the docs root. maybe it even opens a
// menu with links to several relevant docs for the page
export const DocsLinkItem = () => (
  <li>
    <a
      className={linkStyles(false)}
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

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sans-md text-raise border-secondary flex flex-col border-r">
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
      <ul className="space-y-0.5">{children}</ul>
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
