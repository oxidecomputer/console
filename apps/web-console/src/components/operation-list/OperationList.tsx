import React from 'react'
import cn from 'classnames'

import type { IconName } from '@oxide/ui'
import { Icon } from '@oxide/ui'

type ItemProps = {
  label: string
  href?: string
  icon: IconName
  children?: React.ReactNode
}

const listItem = 'flex items-center text-xs space-x-2 p-1 hover:bg-gray-400'

const ListItem = ({ label, icon, href = '#', children }: ItemProps) => (
  <li>
    <a href={href} className={listItem}>
      <Icon name={icon} className="mr-2" />
      {label}
    </a>
    {children}
  </li>
)

type SubItemProps = { href?: string; children: React.ReactNode }

const subItem = `
  ml-6 text-xxs
  before:content-['├'] before:text-yellow-500 before:w-3.5 before:inline-block
  last-of-type:before:content-['└']
`

const subItemLink =
  'inline-block p-1 w-[calc(100% - 0.875rem)] hover:bg-gray-400'

const SubItem = ({ href = '#', children }: SubItemProps) => (
  <li className={subItem}>
    <a className={subItemLink} href={href}>
      {children}
    </a>
  </li>
)

export const OperationList = (props: { className?: string }) => (
  <nav className={cn('uppercase', props.className)}>
    <header className="p-1 text-sm text-green-500">Operations</header>
    <ul className="mt-1 space-y-1">
      <ListItem label="System" icon="dashboard" />
      <ListItem label="Resources" icon="resources">
        <ul className="mt-1 space-y-1">
          <SubItem>Instances</SubItem>
          <SubItem>VPCs</SubItem>
          <SubItem>Images</SubItem>
          <SubItem>Disks</SubItem>
          <SubItem>Snapshots</SubItem>
          <SubItem>Firewall Rules</SubItem>
          <SubItem>IP Addresses</SubItem>
        </ul>
      </ListItem>
      <ListItem label="Organizations" icon="organization" />
      <ListItem label="Projects" icon="projects" />
      <ListItem label="IAM" icon="users" />
    </ul>
  </nav>
)
