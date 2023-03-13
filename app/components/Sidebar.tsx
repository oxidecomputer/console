import cn from 'classnames'
import { NavLink } from 'react-router-dom'

import { Action16Icon, Button, Document16Icon, Truncate } from '@oxide/ui'

const linkStyles =
  'flex h-7 items-center rounded px-2 text-sans-md hover:bg-hover svg:mr-2 svg:text-quinary text-secondary'

// TODO: this probably doesn't go to the docs root. maybe it even opens a
// menu with links to several relevant docs for the page
export const DocsLinkItem = () => (
  <li>
    <a
      className={linkStyles}
      href="https://docs.oxide.computer"
      target="_blank"
      rel="noreferrer"
    >
      <Document16Icon /> Docs
    </a>
  </li>
)

// this is mousetrap's logic for the `mod` modifier shortcut
// https://github.com/ccampbell/mousetrap/blob/2f9a476b/mousetrap.js#L135
const modKey = /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'cmd' : 'ctrl'

const JumpToButton = () => (
  <Button
    variant="ghost"
    size="sm"
    // TODO: click should open jump to menu
    onClick={() => alert('click not implemented, press cmd+k')}
    className="w-full !px-2"
    // TODO: the more I use innerClassName the wronger it feels
    innerClassName="w-full justify-between text-quaternary"
  >
    <span className="flex items-center">
      <Action16Icon className="mr-2 text-quinary" /> Jump to
    </span>
    <div className="text-mono-xs">{modKey}+K</div>
  </Button>
)

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col border-r text-sans-md text-default border-secondary">
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
  <div className="my-4 mx-3 space-y-1">
    {heading && (
      <div className="mb-2 text-mono-sm text-quaternary">
        <Truncate text={heading} maxLength={24} />
      </div>
    )}
    <nav>
      <ul className="space-y-0.5">{children}</ul>
    </nav>
  </div>
)

export const NavLinkItem = (props: {
  to: string
  children: React.ReactNode
  end?: boolean
  disabled?: boolean
}) => (
  <li>
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(linkStyles, {
          'text-accent !bg-accent-secondary svg:!text-accent-tertiary': isActive,
          'pointer-events-none text-disabled': props.disabled,
        })
      }
      end={props.end}
    >
      {props.children}
    </NavLink>
  </li>
)
