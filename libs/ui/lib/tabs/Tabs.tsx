import React from 'react'

import type {
  TabProps as RTabProps,
  TabsProps as RTabsProps,
  TabListProps as RTabListProps,
  TabPanelsProps as RTabPanelsProps,
  TabPanelProps as RTabPanelProps,
} from '@reach/tabs'
import {
  Tabs as RTabs,
  TabList as RTabList,
  Tab as RTab,
  TabPanels as RTabPanels,
  TabPanel as RTabPanel,
} from '@reach/tabs'

import cn from 'classnames'

// the tabs component is just @reach/tabs plus custom CSS
import './Tabs.css'
import { flattenChildren, pluckFirstOfType } from '../../util/children'
import { invariant } from '../../util/invariant'

export interface TabsProps extends ElementType<'div', RTabsProps> {}

export function Tabs({ children, className, ...props }: TabsProps) {
  // Validate at dev time that tabs and panels are correct and in the right order
  invariant(
    (() => {
      const childArray = flattenChildren(children)
      const tabs = flattenChildren(
        pluckFirstOfType(childArray, Tab.List)?.props.children
      ) as React.ReactElement[]
      const panels = flattenChildren(
        pluckFirstOfType(childArray, Tab.Panels)?.props.children
      ) as React.ReactElement[]

      return tabs
        .map((tab, i) => tab.props.id === panels[i].props['for'])
        .every(Boolean)
    })(),
    'Missing tab or tabs out of order'
  )

  return (
    <RTabs as="div" className={cn(className)} {...props}>
      {children}
    </RTabs>
  )
}

export interface TabProps extends ElementType<'a', RTabProps> {
  id: string
}
export function Tab({ className, ...props }: TabProps) {
  return <RTab as="a" className={cn('!no-underline', className)} {...props} />
}

export interface TabListProps extends ElementType<'div', RTabListProps> {}
Tab.List = (props: TabListProps) => {
  const after =
    'after:block after:border-b after:w-full after:border-gray-400 after:ml-2.5'
  return <RTabList as="div" className={after} {...props} />
}

export interface TabPanelsProps extends ElementType<'div', RTabPanelsProps> {}
Tab.Panels = (props: TabPanelsProps) => {
  return <RTabPanels as="div" {...props} />
}

export interface TabPanelProps extends RTabPanelProps {
  /** The `id` of the tab which this is a label for */
  for: string
}
Tab.Panel = ({ ['for']: id, ...props }: TabPanelProps) => (
  <RTabPanel id={`${id}-panel`} {...props} />
)
