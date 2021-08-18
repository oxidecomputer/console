import React from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'

import { Icon } from '@oxide/ui'
import { GlobalNav } from '../components/GlobalNav'

const NavLinkItem = (props: { to: string; children: React.ReactNode }) => (
  <li>
    <NavLink
      to={props.to}
      className="flex items-center space-x-2 p-1 hover:bg-gray-400 svg:mr-3 svg:text-gray-300"
      activeClassName="text-white svg:!text-green-500"
      end
    >
      {props.children}
    </NavLink>
  </li>
)

const InstanceLayout = () => {
  const { instanceName } = useParams()

  return (
    <div className="grid h-screen grid-cols-[14rem,auto] grid-rows-[4.5rem,auto]">
      <div className="p-5 bg-gray-500 text-green-500 flex items-center">
        <Link to="/">
          <span className="mr-4" style={{ fontSize: '.625rem' }}>
            &#9664;
          </span>
          <span className="text-xs font-mono font-light uppercase">Back</span>
        </Link>
      </div>
      <header className="py-4 px-6 self-center">
        <GlobalNav />
      </header>
      <div className="pb-6 pt-1 overflow-auto bg-gray-500">
        <div className="px-5 mb-4">
          <div className="uppercase text-xs font-mono font-light text-green-500">
            Instance
          </div>
          <div className="text-sm font-light">{instanceName}</div>
        </div>
        <hr className="border-gray-400 mt-8" />
        <nav className="mt-8 px-3">
          <ul className="space-y-0.5 text-sm text-gray-100 font-light">
            <NavLinkItem to="">
              <Icon name="dashboard" /> Overview
            </NavLinkItem>
            <NavLinkItem to="metrics">
              <Icon name="metrics" /> Metrics
            </NavLinkItem>
            <NavLinkItem to="audit">
              <Icon name="document" /> Activity
            </NavLinkItem>
            <NavLinkItem to="access">
              <Icon name="access" /> Access &amp; IAM
            </NavLinkItem>
            <NavLinkItem to="resize">
              <Icon name="resize" /> Resize
            </NavLinkItem>
            <NavLinkItem to="networking">
              <Icon name="networking" /> Networking
            </NavLinkItem>
            <NavLinkItem to="storage">
              <Icon name="storage" /> Storage
            </NavLinkItem>
            <NavLinkItem to="tags">
              <Icon name="tags" /> Tags
            </NavLinkItem>
          </ul>
        </nav>
      </div>
      <main className="overflow-auto py-2 px-6">
        <Outlet />
      </main>
    </div>
  )
}

// hot reload doesn't work with `export default () => ...` ???
export default InstanceLayout
