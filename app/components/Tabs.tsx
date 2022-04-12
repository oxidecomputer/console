import React from 'react'
import { useSearchParams } from 'react-router-dom'
import type { TabsProps } from '@oxide/ui'
import { Tabs as UITabs, Tab as UITab } from '@oxide/ui'
import { flattenChildren, kebabCase, pluckAllOfType } from '@oxide/util'
import invariant from 'tiny-invariant'

/**
 * Wrapper for UI lib Tabs that syncs current tab with arg in URL query string.
 *
 * If you don't want the query arg functionality, e.g., if you have multiple
 * sets of tabs on the same page, use the other Tabs directly.
 */
export function Tabs(props: TabsProps) {
  const tabs = pluckAllOfType(flattenChildren(props.children), Tab)

  // override default index (0) if there is a recognized tab ID in the query string
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTabId = searchParams.get('tab')
  const tabIds = tabs.map((tab) => {
    const { name, children } = tab.props
    invariant(
      name || typeof children === 'string',
      'When searchSync is on, either Tab children must be a string or name must be provided. '
    )
    return name ?? kebabCase(children as string)
  })

  const index =
    searchTabId && tabIds.includes(searchTabId) ? tabIds.indexOf(searchTabId) : 0

  function onChange(newIdx: number) {
    // no arg is the canonical representation of first tab
    if (newIdx === 0) {
      searchParams.delete('tab')
    } else {
      searchParams.set('tab', tabIds[newIdx])
    }
    setSearchParams(searchParams, { replace: true })
  }

  return <UITabs {...props} index={index} onChange={onChange} />
}

export const Tab = UITab
