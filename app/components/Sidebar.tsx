import cn from 'classnames'
import { NavLink as RRNavLink } from 'react-router-dom'

import { Document16Icon } from '@oxide/ui'
import { Wrap, flattenChildren, pluckFirstOfType } from '@oxide/util'

import { ProjectSelector } from 'app/components/ProjectSelector'

interface SidebarProps {
  children: React.ReactNode
}
export function Sidebar({ children }: SidebarProps) {
  const childArray = flattenChildren(children)
  const projectSelector = pluckFirstOfType(childArray, ProjectSelector)

  return (
    <div className="ox-sidebar relative flex flex-col border-r px-3 pt-5 text-sans-md text-default border-secondary">
      {projectSelector}
      <Wrap
        when={projectSelector}
        with={<div className="overflow-y-auto mt-10 flex flex-col flex-grow" />}
      >
        {childArray}
        <Sidebar.Footer>
          <NavLinkItem to="https://docs.oxide.computer">
            <Document16Icon /> Documentation
          </NavLinkItem>
        </Sidebar.Footer>
      </Wrap>
    </div>
  )
}

interface SidebarNav {
  children: React.ReactNode
  heading?: string
}
Sidebar.Nav = ({ children, heading }: SidebarNav) => {
  return (
    <div className="ox-sidebar-nav space-y-1">
      {heading ? <span className="ml-2 text-mono-sm text-secondary">{heading}</span> : null}
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
    <ul className="ox-sidebar-footer w-full pb-3">
      <span className="heading hidden ml-2 text-mono-sm text-secondary">More</span>

      <div>{children}</div>
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
      onClick={(e) => {
        // TODO: Probably a better way to do this. Should it open in a new page?
        if (props.to.startsWith('http')) {
          window.open(props.to, '_blank')
          e.preventDefault()
        }
      }}
      className={({ isActive }) =>
        cn(
          'flex h-7 items-center rounded p-1.5 text-sans-md hover:bg-hover svg:mr-2 svg:text-tertiary',
          isActive ? 'text-accent !bg-accent-secondary svg:!text-accent' : 'text-default'
        )
      }
      end={props.end}
    >
      {props.children}
    </RRNavLink>
  </li>
)
