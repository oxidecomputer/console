import React from 'react'
import { NavLink } from 'react-router-dom'

import type { IconName } from '@oxide/ui'
import { Icon } from '@oxide/ui'

type ItemProps = {
  label: string
  to?: string
  icon: IconName
}

const linkStyle = 'flex items-center space-x-2 p-1 hover:bg-gray-400'

const ListItem = ({ label, icon, to = '#' }: ItemProps) => (
  <li>
    <NavLink to={to} className={linkStyle} activeClassName="text-white" end>
      <Icon name={icon} className="mr-3" />
      {label}
    </NavLink>
  </li>
)

export const OperationList = (props: { className?: string }) => (
  <nav className={props.className}>
    <ul className="mt-2 space-y-0.5 text-sm text-gray-100 font-light">
      <ListItem label="Overview" icon="dashboard" to="" />
      <ListItem label="Instances" icon="instances" to="instances" />
      <ListItem label="Networking" icon="networking" to="networking" />
      <ListItem label="Storage" icon="storage" to="storage" />
      <ListItem label="Metrics" icon="stopwatch" to="metrics" />
      <ListItem label="Audit log" icon="file" to="audit" />
      <ListItem label="Access & IAM" icon="users" to="access" />
      <ListItem label="Settings" icon="pen" to="settings" />
    </ul>
  </nav>
)
