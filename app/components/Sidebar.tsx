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
    <div className="ox-sidebar pb-6 pt-5 overflow-auto border-r border-secondary px-3 text-default text-sans-md">
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
        <span className="text-secondary text-mono-sm ml-2">{heading}</span>
      ) : null}
      <nav>
        <ul className="space-y-0.5">{children}</ul>
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
    <ul className="space-y-0.5 absolute bottom-0 pb-3 w-[12.5rem]">
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
          'flex text-sans-md rounded-sm h-7 items-center p-1.5 hover:bg-raise svg:mr-2 svg:text-tertiary',
          {
            'text-accent svg:!text-accent !bg-accent-dim': isActive,
          }
        )
      }
      end={props.end}
    >
      {props.children}
    </RRNavLink>
  </li>
)
