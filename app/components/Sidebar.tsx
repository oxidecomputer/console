import cn from 'classnames'
import { NavLink } from 'react-router-dom'

import { Button, Document16Icon } from '@oxide/ui'

import { SiloSystemPicker } from './TopBarPicker'

const linkStyles =
  'flex h-7 items-center rounded p-1.5 text-sans-md hover:bg-hover svg:mr-2 svg:text-tertiary text-default'

// TODO: this probably doesn't go to the docs root. maybe it even opens a
// menu with links to several relevant docs for the page
export const DocsLink = () => (
  <a
    className={linkStyles}
    href="https://docs.oxide.computer"
    target="_blank"
    rel="noreferrer"
  >
    <Document16Icon /> Docs
  </a>
)

// this is mousetrap's logic for the `mod` modifier shortcut
// https://github.com/ccampbell/mousetrap/blob/2f9a476b/mousetrap.js#L135
const modKey = /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'cmd' : 'ctrl'

const JumpToButton = () => (
  <Button
    variant="ghost"
    color="secondary"
    size="xs"
    // TODO: click should open jump to menu
    onClick={() => alert('click not implemented, press cmd+k')}
    className="w-full"
    // TODO: the more I use innerClassName the wronger it feels
    innerClassName="w-full justify-between"
  >
    {/* TODO: need "action" lightning bolt icon */}⚡ Jump to
    {/* TODO: cmd or ctrl is is system-dependent */}
    <div className="">{modKey}+K</div>
  </Button>
)

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col border-r text-sans-md text-default border-secondary">
      <div className="border-b border-secondary h-[60px] px-3 flex">
        {/* TODO: don't mention Silo if user can't see system resources */}
        <SiloSystemPicker />
      </div>
      <div className="mx-3 mt-4">
        <JumpToButton />
      </div>
      {children}
    </div>
  )
}

interface SidebarNav {
  children: React.ReactNode
  heading?: string
}

Sidebar.Nav = ({ children, heading }: SidebarNav) => (
  <div className="space-y-1 my-4 mx-3">
    {heading && <span className="text-mono-sm text-secondary">{heading}</span>}
    <nav>
      <ul className="space-y-0.5">{children}</ul>
    </nav>
  </div>
)

// TODO: I took out the height-responsive behavior on the sidebar footer. Think
// about that, I guess.

export const NavLinkItem = (props: {
  to: string
  children: React.ReactNode
  end?: boolean
}) => (
  <li>
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(linkStyles, { 'text-accent !bg-accent-secondary svg:!text-accent': isActive })
      }
      end={props.end}
    >
      {props.children}
    </NavLink>
  </li>
)
