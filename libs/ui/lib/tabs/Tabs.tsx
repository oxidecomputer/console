import React from 'react'

import type { TabListProps as RListProps } from '@reach/tabs'
import {
  Tabs as RTabs,
  TabList as RList,
  Tab,
  TabPanels,
  TabPanel,
} from '@reach/tabs'

// the tabs component is just @reach/tabs plus custom CSS
import './Tabs.css'
import type { ChildrenProp } from '../../util/children'
import { pluckType } from '../../util/children'
import { Badge } from '../badge/Badge'

interface TabsProps {
  children: React.ReactNode
  className?: string
}
export function Tabs({ children, ...props }: TabsProps) {
  const childArray = React.Children.toArray(children)
  const list = pluckType(childArray, Tabs.List)
  const views = pluckType(childArray, Tabs.Views)
  return (
    <RTabs {...props}>
      {list}
      {views}
    </RTabs>
  )
}

Tabs.List = ({ children, ...props }: RListProps) => {
  const after =
    'after:block after:border-b after:w-full after:border-gray-400 after:ml-2.5'
  return (
    <RList className={`${after}`} {...props}>
      {children}
    </RList>
  )
}

export interface TabLabelProps extends ChildrenProp {
  badge?: string
}
Tabs.Label = ({ badge, children }: TabLabelProps) => {
  return (
    <Tab className="whitespace-nowrap min-w-max">
      {children}
      {badge && (
        <Badge
          className="ml-2 pb-0.3 text-current"
          color="darkGray"
          variant="dim"
        >
          {badge}
        </Badge>
      )}
    </Tab>
  )
}

Tabs.Views = ({ children }: ChildrenProp) => {
  return (
    <TabPanels>
      {React.Children.map(children, (child) => (
        <TabPanel>{child}</TabPanel>
      ))}
    </TabPanels>
  )
}
