import React from 'react'
import tw from 'twin.macro'

import type { IconName } from '@oxide/ui'
import { Icon } from '@oxide/ui'

type ItemProps = {
  label: string
  href?: string
  icon: IconName
  children?: React.ReactNode
}

const itemLink = tw`flex items-center text-xs space-x-2 p-1 hover:bg-gray-700`

const ListItem = ({ label, icon, href = '#', children }: ItemProps) => (
  <li>
    <a css={itemLink} href={href}>
      <Icon name={icon} tw="mr-2" />
      {label}
    </a>
    {children}
  </li>
)

type SubItemProps = { href?: string; children: React.ReactNode }

const subItem = tw`
  ml-6 text-xxs
  before:(content['├'] text-yellow-500 w-3.5 inline-block) 
  last-of-type:before:content['└']
`
const subItemLink = tw`inline-block p-1 width[calc(100% - 0.875rem)] hover:bg-gray-700`

const SubItem = ({ href = '#', children }: SubItemProps) => (
  <li css={subItem}>
    <a css={subItemLink} href={href}>
      {children}
    </a>
  </li>
)

export const OperationList = (props: { className?: string }) => (
  <nav tw="uppercase" className={props.className}>
    <header tw="p-1 text-sm text-green">Operations</header>
    <ul tw="mt-1 space-y-1">
      <ListItem label="System" icon="dashboard" />
      <ListItem label="Resources" icon="resources">
        <ul tw="mt-1 space-y-1">
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
