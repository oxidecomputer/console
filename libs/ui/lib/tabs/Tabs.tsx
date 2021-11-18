import React, { createContext, useContext, useMemo } from 'react'

import type {
  TabProps as RTabProps,
  TabsProps as RTabsProps,
  TabListProps as RTabListProps,
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

import './Tabs.css'
import { flattenChildren, pluckAllOfType } from '../../util/children'
import { invariant } from '../../util/invariant'

interface TabContextValue {
  id: string
}
const TabContext = createContext<TabContextValue>({ id: '' })

export interface TabsProps extends ElementType<'div', RTabsProps> {
  id: string
}

export function Tabs({ id, children, className, ...props }: TabsProps) {
  const childArray = flattenChildren(children)
  const tabs = pluckAllOfType(childArray, Tab)
  const panels = pluckAllOfType(childArray, Tab.Panel)
  invariant(
    childArray.length === 0,
    'Expected Tabs to only contain Tab and Tab.Panel components'
  )
  invariant(
    tabs
      .map((tab, i) => tab.props.id === panels[i].props['for'])
      .every(Boolean),
    'Not all tabs were matched or aligned with its corresponding tab panel'
  )

  const context = useMemo(() => ({ id }), [id])
  return (
    <TabContext.Provider value={context}>
      <RTabs as="div" className={cn(className)} {...props}>
        <RTabList>{tabs}</RTabList>
        <RTabPanels>{panels}</RTabPanels>
      </RTabs>
    </TabContext.Provider>
  )
}

export interface TabProps extends ElementType<'button', RTabProps> {
  id: string
}
export function Tab({ id, className, ...props }: TabProps) {
  return (
    <RTab
      as="button"
      id={id}
      className={cn('!no-underline', className)}
      {...props}
    />
  )
}

export interface TabPanelProps extends RTabPanelProps {
  /** The `id` of the tab which this is a label for */
  for: string
}
Tab.Panel = ({ ['for']: id, ...props }: TabPanelProps) => (
  <RTabPanel id={`${id}-panel`} aria-labelledby={id} {...props} />
)
