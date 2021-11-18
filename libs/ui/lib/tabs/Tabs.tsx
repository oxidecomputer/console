import React from 'react'

import type {
  TabProps as RTabProps,
  TabsProps as RTabsProps,
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
import { addKey, flattenChildren, pluckAllOfType } from '../../util/children'
import { invariant } from '@oxide/util'
import type { AriaLabel } from '../../util/aria'

export type TabsProps = ElementType<'div', RTabsProps> &
  AriaLabel & {
    id: string
  }

export function Tabs({
  id,
  'aria-labelledby': labelledby,
  'aria-label': label,
  children,
  ...props
}: TabsProps) {
  const childArray = flattenChildren(children)
  const tabs = pluckAllOfType(childArray, Tab).map(
    addKey((i) => `${id}-tab-${i}`)
  )
  const panels = pluckAllOfType(childArray, Tab.Panel).map(
    addKey((i) => `${id}-panel-${i}`)
  )

  invariant(
    childArray.length === 0,
    'Expected Tabs to only contain Tab and Tab.Panel components'
  )

  invariant(
    tabs.length === panels.length,
    'Expected there to be exactly one Tab for every Tab.Panel'
  )

  return (
    <RTabs id={id} as="div" {...props}>
      <RTabList aria-labelledby={labelledby} aria-label={label}>
        {tabs}
      </RTabList>
      <RTabPanels>{panels}</RTabPanels>
    </RTabs>
  )
}

export interface TabProps extends ElementType<'button', RTabProps> {}
export function Tab({ className, ...props }: TabProps) {
  return (
    <RTab as="button" className={cn('!no-underline', className)} {...props} />
  )
}

export interface TabPanelProps extends RTabPanelProps {}
Tab.Panel = ({ ...props }: TabPanelProps) => <RTabPanel {...props} />
