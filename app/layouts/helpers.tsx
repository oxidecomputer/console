import React from 'react'
import { Link, NavLink } from 'react-router-dom'

import { classed } from '@oxide/ui'
import cn from 'classnames'

export const PageContainer = classed.div`grid h-screen grid-cols-[14rem,auto]`
export const Sidebar = classed.div`pb-6 pt-1 overflow-auto bg-gray-500`
export const ContentPane = classed.div`overflow-auto pt-20 pb-2 px-10`
export const SidebarDivider = classed.hr`border-gray-400 mt-8`

const Back = (props: { to: string }) => (
  <div className="mb-6 bg-gray-500 text-green-500 flex items-center">
    <Link to={props.to}>
      <span className="mr-3" style={{ fontSize: '.625rem' }}>
        &#9664;
      </span>
      <span className="text-xs font-mono font-light uppercase">Back</span>
    </Link>
  </div>
)

// TODO: this is not actually a picker yet, it just says what you're on
export const Picker = (props: {
  category: string
  resource: string
  backTo: string
}) => (
  <div className="px-5 my-4">
    {/* TODO: obviously this is not the right `to` */}
    <Back to={props.backTo} />
    <div className="uppercase text-xs font-mono font-light text-green-500">
      {props.category}
    </div>
    <div className="text-sm font-light">{props.resource}</div>
  </div>
)

export const NavList = (props: { children: React.ReactNode }) => (
  <nav className="mt-8 px-3">
    <ul className="space-y-0.5 text-sm text-gray-100 font-light">
      {props.children}
    </ul>
  </nav>
)

export const NavLinkItem = (props: {
  to: string
  children: React.ReactNode
}) => (
  <li>
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          'flex items-center p-1 hover:bg-gray-400 svg:mr-2 svg:text-gray-300',
          { 'text-white svg:!text-green-500': isActive }
        )
      }
      end
    >
      {props.children}
    </NavLink>
  </li>
)
