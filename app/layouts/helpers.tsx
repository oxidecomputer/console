import React from 'react'
import { NavLink } from 'react-router-dom'

import { classed } from '@oxide/ui'
import cn from 'classnames'

export const PageContainer = classed.div`grid h-screen grid-cols-[14rem,auto]`
export const Sidebar = classed.div`pb-6 pt-6 overflow-auto bg-gray-800 border-r border-gray-450 px-3`
export const ContentPane = classed.div`overflow-auto pt-14 pb-2 grid grid-cols-[2.5rem,auto,2.5rem] children:grid-col-2 auto-rows-min gap-y-2`

export const NavList = (props: { children: React.ReactNode }) => (
  <nav className="mt-8">
    <ul className="space-y-0.5 text-sm text-gray-100 font-light">
      {props.children}
    </ul>
  </nav>
)

export const NavLinkItem = (props: {
  to: string
  children: React.ReactNode
  end?: boolean
}) => (
  <li>
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          'flex text-sans-md items-center p-1 hover:bg-gray-400 svg:mr-2 svg:text-gray-300',
          { 'text-white svg:!text-green-500': isActive }
        )
      }
      end={props.end}
    >
      {props.children}
    </NavLink>
  </li>
)
