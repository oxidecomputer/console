import React, { useMemo } from 'react'

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

export type TabsProps = ElementType<'div', RTabsProps> & {
  id: string
  fullWidth?: boolean
  className?: string
}

export function Tabs({
  id,
  fullWidth,
  'aria-labelledby': labelledby,
  'aria-label': label,
  children,
  className,
  ...props
}: TabsProps) {
  const childArray = useMemo(() => flattenChildren(children), [children])
  const tabs = useMemo(
    () => pluckAllOfType(childArray, Tab).map(addKey((i) => `${id}-tab-${i}`)),
    [childArray, id]
  )
  const panels = useMemo(
    () =>
      pluckAllOfType(childArray, Tab.Panel).map(
        addKey((i) => `${id}-panel-${i}`)
      ),
    [childArray, id]
  )

  invariant(
    tabs.length === panels.length,
    'Expected there to be exactly one Tab for every Tab.Panel'
  )

  const after =
    'after:block after:w-full after:border-b after:ml-2 after:border-gray-500'
  const before =
    'before:block before:min-w-max before:w-8 before:border-b before:mr-2 before:flex-shrink-0 before:border-gray-500'

  return (
    <RTabs
      id={id}
      as="div"
      className={cn(className, fullWidth && '!col-span-3')}
      {...props}
    >
      <RTabList
        aria-labelledby={labelledby}
        aria-label={label}
        className={cn(after, fullWidth && before)}
      >
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
Tab.Panel = function Panel({ ...props }: TabPanelProps) {
  return <RTabPanel {...props} />
}
