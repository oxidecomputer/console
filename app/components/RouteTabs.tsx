import cn from 'classnames'
import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'

import { useIsActivePath } from 'app/hooks/use-is-active-path'

const selectTab = (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (e.key === 'ArrowLeft') {
    e.stopPropagation()
    e.preventDefault()
    const sibling = (e.target as HTMLDivElement).previousSibling as HTMLDivElement | null
    if (sibling) {
      sibling.focus()
      sibling.click()
    }
  }
  if (e.key === 'ArrowRight') {
    e.stopPropagation()
    e.preventDefault()
    const sibling = (e.target as HTMLDivElement).nextSibling as HTMLDivElement | null
    if (sibling) {
      sibling.focus()
      sibling.click()
    }
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
      <div role="tablist" className="ox-tabs-list flex" onKeyDown={selectTab}>
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
  const isActive = useIsActivePath(to)
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
