import { NavLink as RRNavLink, useLocation } from 'react-router-dom'
import cn from 'classnames'
import { Document16Icon, Settings16Icon } from '@oxide/ui'

interface SidebarProps {
  children: React.ReactNode
}
export function Sidebar({ children }: SidebarProps) {
  const { pathname } = useLocation()
  return (
    <div className="ox-sidebar space-y-10 overflow-auto border-r px-3 pb-6 pt-5 text-sans-md text-default border-secondary">
      {children}
      <Sidebar.Footer>
        <NavLinkItem to="https://docs.oxide.computer">
          <Document16Icon /> Documentation
        </NavLinkItem>
        {!pathname.startsWith('/settings') && (
          <NavLinkItem to="/settings">
            <Settings16Icon /> Settings
          </NavLinkItem>
        )}
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
    // TODO: The `w-[12.5rem] is hand calculated and very likely isn't what we want. Do something better here
    <ul className="absolute bottom-0 w-[12.5rem] space-y-0.5 pb-3">{children}</ul>
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
