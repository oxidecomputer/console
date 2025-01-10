/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router'

import { useIsActivePath } from '~/hooks/use-is-active-path'
import { KEYS } from '~/ui/util/keys'

const selectTab = (e: React.KeyboardEvent<HTMLDivElement>) => {
  const target = e.target as HTMLDivElement
  if (e.key === KEYS.left) {
    e.stopPropagation()
    e.preventDefault()

    const sibling = (target.previousSibling ??
      target.parentElement!.lastChild!) as HTMLDivElement

    sibling.focus()
    sibling.click()
  } else if (e.key === KEYS.right) {
    e.stopPropagation()
    e.preventDefault()

    const sibling = (target.nextSibling ??
      target.parentElement!.firstChild!) as HTMLDivElement

    sibling.focus()
    sibling.click()
  }
}

export interface RouteTabsProps {
  children: ReactNode
  fullWidth?: boolean
}
export function RouteTabs({ children, fullWidth }: RouteTabsProps) {
  return (
    <div className={cn('ox-tabs', { 'full-width': fullWidth })}>
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div role="tablist" className="ox-tabs-list" onKeyDown={selectTab}>
        {children}
      </div>
      {/* TODO: Add aria-describedby for active tab */}
      <div className="ox-tabs-panel" role="tabpanel" tabIndex={0}>
        <Outlet />
      </div>
    </div>
  )
}

export interface TabProps {
  to: string
  children: ReactNode
}
export const Tab = ({ to, children }: TabProps) => {
  const isActive = useIsActivePath({ to })
  return (
    <Link
      role="tab"
      to={to}
      className={cn('ox-tab', { 'is-selected': isActive })}
      tabIndex={isActive ? 0 : -1}
      aria-selected={isActive}
    >
      <div>{children}</div>
    </Link>
  )
}
