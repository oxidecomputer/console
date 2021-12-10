import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

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
import { invariant, kebabCase } from '@oxide/util'

export type TabsProps = Assign<JSX.IntrinsicElements['div'], RTabsProps> & {
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
  const [tabs, panels] = useMemo(() => {
    const childArray = flattenChildren(children)
    const tabs = pluckAllOfType(childArray, Tab).map(
      addKey((i) => `${id}-tab-${i}`)
    )
    const panels = pluckAllOfType(childArray, Tab.Panel).map(
      addKey((i) => `${id}-panel-${i}`)
    )
    return [tabs, panels]
  }, [children, id])

  // TODO: add flag to Tabs to toggle query string sync on and off

  // override default index (0) if there is a recognized tab ID in the query string
  const [searchParams, setSearchParams] = useSearchParams()
  const queryTabId = searchParams.get('tab')
  const tabIds = tabs.map((t) => t.props.queryId ?? kebabCase(t.props.children))
  const selectedTabIndex =
    queryTabId && tabIds.includes(queryTabId) ? tabIds.indexOf(queryTabId) : 0
  function onTabChange(newIdx: number) {
    searchParams.set('tab', tabIds[newIdx])
    setSearchParams(searchParams)
  }

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
      index={selectedTabIndex}
      onChange={onTabChange}
    >
      <RTabList
        aria-labelledby={labelledby}
        aria-label={label}
        className={cn(after, fullWidth && before)}
      >
        {tabs}
      </RTabList>
      <RTabPanels className={cn(fullWidth && 'mx-10')}>{panels}</RTabPanels>
    </RTabs>
  )
}

export type TabProps = Assign<JSX.IntrinsicElements['button'], RTabProps> & {
  queryId?: string
}
export function Tab({ className, ...props }: TabProps) {
  return (
    <RTab as="button" className={cn('!no-underline', className)} {...props} />
  )
}

export interface TabPanelProps extends RTabPanelProps {}
Tab.Panel = function Panel({ ...props }: TabPanelProps) {
  return <RTabPanel {...props} />
}
