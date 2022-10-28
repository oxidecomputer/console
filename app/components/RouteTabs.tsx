import cn from 'classnames'
import type { LinkProps } from 'react-router-dom'
import { NavLink, Outlet } from 'react-router-dom'

import type { ChildrenProp } from '@oxide/util'

type RouteTabsProps = ChildrenProp & { fullWidth?: boolean }
export function RouteTabs({ children, fullWidth }: RouteTabsProps) {
  return (
    <div className={cn('ox-tabs', { 'full-width': fullWidth })}>
      <div className="ox-tabs-list flex">{children}</div>
      <div className="ox-tabs-panel">
        <Outlet />
      </div>
    </div>
  )
}

type TabProps = Pick<LinkProps, 'to'> & ChildrenProp
export const Tab = ({ to, children }: TabProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn('ox-tab', { 'is-selected': isActive })}
    >
      <div>{children}</div>
    </NavLink>
  )
}
