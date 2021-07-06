import React from 'react'

import type { IconName } from '@oxide/ui'
import { Icon } from '@oxide/ui'

type ItemProps = {
  label: string
  href?: string
  icon: IconName
  children?: React.ReactNode
}

const listItem = 'flex items-center space-x-2 p-1 hover:bg-gray-400'

const ListItem = ({ label, icon, href = '#', children }: ItemProps) => (
  <li>
    <a href={href} className={listItem}>
      <Icon name={icon} className="mr-3" />
      {label}
    </a>
    {children}
  </li>
)

export const OperationList = (props: { className?: string }) => (
  <nav className={props.className}>
    <header className="p-1 text-xs text-green-500 uppercase font-mono tracking-wider">
      Operations
    </header>
    <ul className="mt-2 space-y-1 text-sm tracking-wide text-gray-100">
      <ListItem label="System" icon="dashboard" />
      <ListItem label="Resources" icon="resources" />
      <ListItem label="Organizations" icon="organization" />
      <ListItem label="Projects" icon="projects" />
      <ListItem label="IAM" icon="users" />
    </ul>
  </nav>
)
