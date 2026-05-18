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
import { hasModifier, KEYS } from '~/ui/util/keys'

const selectTab = (e: React.KeyboardEvent<HTMLDivElement>) => {
  // Don't intercept modified arrow keys (Cmd for browser back/forward, etc.)
  if (hasModifier(e)) return

  const target = e.target as HTMLElement
  const isArrow = e.key === KEYS.left || e.key === KEYS.right
  if (!isArrow) return

  // Walk only role=tab siblings so non-tab children (e.g. the hover pill) are skipped
  const tabs = Array.from(
    target.parentElement!.querySelectorAll<HTMLElement>('[role="tab"]')
  )
  const i = tabs.indexOf(target)
  if (i === -1) return

  e.stopPropagation()
  e.preventDefault()

  const next =
    e.key === KEYS.left
      ? tabs[(i - 1 + tabs.length) % tabs.length]
      : tabs[(i + 1) % tabs.length]
  next.focus()
  next.click()
}

export interface RouteTabsProps {
  children: ReactNode
  fullWidth?: boolean
  sideTabs?: boolean
  tabListClassName?: string
}
/** Tabbed views, controlling both the layout and functioning of tabs and the panel contents.
 *  sideTabs: Whether the tabs are displayed on the side of the panel. Default is false.
 */
export function RouteTabs({
  children,
  fullWidth,
  sideTabs = false,
  tabListClassName,
}: RouteTabsProps) {
  /* TODO: Add aria-describedby for active tab */
  return (
    <div
      className={cn(sideTabs ? 'ox-side-tabs flex' : 'ox-tabs', {
        'full-width': !sideTabs && fullWidth,
      })}
    >
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div
        role="tablist"
        className={cn(sideTabs ? 'ox-side-tabs-list' : 'ox-tabs-list', tabListClassName)}
        onKeyDown={selectTab}
      >
        {!sideTabs && <span className="ox-tab-pill" aria-hidden="true" />}
        {children}
      </div>

      <div
        className={cn('ox-tabs-panel @container', { 'ml-5 grow': sideTabs })}
        role="tabpanel"
        tabIndex={0}
      >
        <Outlet />
      </div>
    </div>
  )
}

export interface TabProps {
  to: string
  /**
   * Used in rare cases when a tab has sidebar tabs underneath and we want to be
   * able to link directly to the first sidebar tab, but we of course also want
   * this tab to appear active for all the sidebar tabs. See instance metrics.
   */
  activePrefix?: string
  children: ReactNode
}
export const Tab = ({ to, activePrefix, children }: TabProps) => {
  const isActive = useIsActivePath({ to: activePrefix || to })
  return (
    <Link
      role="tab"
      to={to}
      className={cn('ox-tab', { 'is-selected': isActive })}
      tabIndex={isActive ? 0 : -1}
      aria-selected={isActive}
      data-active={isActive ? '' : undefined}
    >
      <div>{children}</div>
    </Link>
  )
}
