import type {
  TabPanelProps as RTabPanelProps,
  TabProps as RTabProps,
  TabsProps as RTabsProps,
} from '@reach/tabs'
import { useTabsContext } from '@reach/tabs'
import {
  Tab as RTab,
  TabList as RTabList,
  TabPanel as RTabPanel,
  TabPanels as RTabPanels,
  Tabs as RTabs,
} from '@reach/tabs'
import cn from 'classnames'
import React, { useMemo } from 'react'
import invariant from 'tiny-invariant'

import { addKey, addProps, flattenChildren, pluckAllOfType } from '@oxide/util'

import './Tabs.css'

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
    const tabs = pluckAllOfType(childArray, Tab).map(addKey((i) => `${id}-tab-${i}`))
    const panels = pluckAllOfType(childArray, Tab.Panel).map(
      addProps<typeof Tab.Panel>((i, panelProps) => ({
        key: `${id}-panel-${i}`,
        index: i,
        className: cn(
          fullWidth &&
            'children:mx-[var(--content-gutter)] children:w-[calc(100%-var(--content-gutter)*2)]',
          panelProps.className
        ),
      }))
    )
    return [tabs, panels]
  }, [children, fullWidth, id])

  invariant(
    tabs.length === panels.length,
    'Expected there to be exactly one Tab for every Tab.Panel'
  )

  const after = 'after:block after:w-full after:border-b after:border-secondary'
  const before =
    'before:block before:min-w-max before:w-10 before:border-b before:flex-shrink-0 before:border-secondary'

  return (
    <RTabs
      id={id}
      as="div"
      className={cn('ox-tabs', className, fullWidth && '!mx-0 !w-full')}
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

export type TabProps = Assign<JSX.IntrinsicElements['button'], RTabProps> & {
  // not actually used inside Tab. it's used by Tabs when searchSync is on
  name?: string
}
export function Tab({ className, ...props }: TabProps) {
  return <RTab as="button" className={cn('!no-underline', className)} {...props} />
}

export interface TabPanelProps extends RTabPanelProps {
  className?: string
}
Tab.Panel = function Panel({ children, className, ...props }: TabPanelProps) {
  const { selectedIndex } = useTabsContext()
  // `index` is a secret prop that's automatically generated by the parents tab
  // component. We use it here to determine if the panel's contents should
  // actually render or not. This is so that we're not firing off multiple
  // queries on page load or making multiple global render calls like for
  // pagination.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isSelected = selectedIndex === (props as any).index
  return (
    <RTabPanel className={cn('ox-tab-panel', className)} {...props}>
      {(isSelected && children) || <React.Fragment />}
    </RTabPanel>
  )
}
