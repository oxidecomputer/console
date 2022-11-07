import cn from 'classnames'
import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export interface RouteTabsProps {
  children: ReactNode
  fullWidth?: boolean
}
export function RouteTabs({ children, fullWidth }: RouteTabsProps) {
  return (
    <div className={cn('ox-tabs', { 'full-width': fullWidth })}>
      <div role="tablist" className="ox-tabs-list flex">
        {children}
      </div>
      <div className="ox-tabs-panel">
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
  return (
    <NavLink
      role="tab"
      to={to}
      className={({ isActive }) => cn('ox-tab', { 'is-selected': isActive })}
    >
      <div>{children}</div>
    </NavLink>
  )
}
