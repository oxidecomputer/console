import React from 'react'
import { useSearchParams } from 'react-router-dom'
import type { TabsProps as UITabsProps } from '@oxide/ui'
import {
  Tabs as UITabs,
  Tab as UITab,
  flattenChildren,
  pluckAllOfType,
} from '@oxide/ui'
import { invariant, kebabCase } from '@oxide/util'

type TabsProps = UITabsProps & {
  /** Sync current tab with arg in URL query string */
  searchSync?: boolean
}

export function Tabs({ searchSync, ...props }: TabsProps) {
  const childArray = flattenChildren(props.children)
  const tabs = pluckAllOfType(childArray, Tab)
  console.log(tabs)

  // override default index (0) if there is a recognized tab ID in the query string
  const [searchParams, setSearchParams] = useSearchParams()
  let index = undefined
  let onChange = undefined
  if (searchSync) {
    const searchTabId = searchParams.get('tab')
    const tabIds = tabs.map((tab) => {
      const { searchId, children } = tab.props
      invariant(
        searchId || typeof children === 'string',
        'When searchSync is on, either Tab children must be a string or searchId must be provided. '
      )
      return searchId ?? kebabCase(children as string)
    })

    index =
      searchTabId && tabIds.includes(searchTabId)
        ? tabIds.indexOf(searchTabId)
        : 0

    onChange = (newIdx: number) => {
      // no arg is the canonical representation of first tab
      if (newIdx === 0) {
        searchParams.delete('tab')
      } else {
        searchParams.set('tab', tabIds[newIdx])
      }
      setSearchParams(searchParams)
    }
  }

  return <UITabs {...props} index={index} onChange={onChange} />
}

export const Tab = UITab
