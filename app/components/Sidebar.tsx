import React from 'react'
import { NavLink as RRNavLink } from 'react-router-dom'
import cn from 'classnames'
import { ProjectSelector } from './ProjectSelector'
import { Chat16Icon, Document16Icon, Settings16Icon } from '@oxide/ui'

interface SidebarProps {
  children: React.ReactNode
}
export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="ox-sidebar bg-gray-800 overflow-auto border-r border-gray-500 px-3 pb-6 pt-5">
      <ProjectSelector className="mb-10" />
      {children}
      <Sidebar.Footer>
        <NavLinkItem to="documentation">
          <Document16Icon /> Documentation
        </NavLinkItem>
        <NavLinkItem to="help">
          <Chat16Icon /> Help & Feedback
        </NavLinkItem>
        <NavLinkItem to="settings">
          <Settings16Icon /> Settings
        </NavLinkItem>
      </Sidebar.Footer>
    </div>
  )
}

interface SidebarNav {
  children: React.ReactNode
  heading?: string
}
Sidebar.Nav = ({ children, heading }: SidebarNav) => {
  return (
    <div className="mt-8 space-y-1">
      {heading ? (
        <span className="ml-2 uppercase text-gray-200 text-mono-sm">
          {heading}
        </span>
      ) : null}
      <nav>
        <ul className="space-y-0.5 font-light text-gray-50">{children}</ul>
      </nav>
    </div>
  )
}

interface SidebarFooter {
  children: React.ReactNode
}
Sidebar.Footer = ({ children }: SidebarFooter) => {
  return (
    // TODO: The `w-[12.5rem] is hand calculated and very likely isn't what we want. Do something better here
    <ul className="absolute bottom-0 w-[12.5rem] space-y-0.5 pb-3 font-light text-gray-50">
      {children}
    </ul>
  )
}

export const NavLinkItem = (props: {
  to: string
  children: React.ReactNode
  end?: boolean
}) => (
  <li>
    <RRNavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          'flex h-7 items-center rounded-sm p-1.5 text-sans-md hover:bg-gray-500 svg:mr-2 svg:text-gray-300',
          {
            '!bg-green-950 text-green-500 svg:!text-green-500': isActive,
          }
        )
      }
      end={props.end}
    >
      {props.children}
    </RRNavLink>
  </li>
)
