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
    <div className="pb-6 pt-5 overflow-auto bg-gray-800 border-r border-gray-400 px-3">
      <ProjectSelector className="mb-10" />
      {children}
      <Sidebar.Footer>
        <NavLink to="documentation">
          <Document16Icon /> Documentation
        </NavLink>
        <NavLink to="help">
          <Chat16Icon /> Help & Feedback
        </NavLink>
        <NavLink to="settings">
          <Settings16Icon /> Settings
        </NavLink>
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
        <span className="text-gray-200 text-mono-sm uppercase ml-2">
          {heading}
        </span>
      ) : null}
      <nav>
        <ul className="space-y-0.5 text-gray-50 font-light">{children}</ul>
      </nav>
    </div>
  )
}

interface SidebarFooter {
  children: React.ReactNode
}
Sidebar.Footer = ({ children }: SidebarFooter) => {
  return (
    <ul className="space-y-0.5 text-gray-50 font-light absolute bottom-0 pb-3">
      {children}
    </ul>
  )
}

export const NavLink = (props: {
  to: string
  children: React.ReactNode
  end?: boolean
}) => (
  <li>
    <RRNavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          'flex text-sans-md rounded-sm items-center p-1 hover:bg-gray-500 svg:mr-2 svg:text-gray-300',
          {
            'text-green-500 svg:!text-green-500 !bg-green-950': isActive,
          }
        )
      }
      end={props.end}
    >
      {props.children}
    </RRNavLink>
  </li>
)
