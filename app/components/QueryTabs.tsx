import { useSearchParams } from 'react-router-dom'

import { Tabs, type TabsRootProps } from '@oxide/ui'

/**
 * Use instead of `Tabs.Root` to sync current tab with arg in URL query string.
 *
 * If you don't want the query arg functionality, e.g., if you have multiple
 * sets of tabs on the same page, use `Tabs.Root` directly.
 */
export function QueryTabs(props: TabsRootProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get('tab') || props.defaultValue

  function onValueChange(newValue: string) {
    if (newValue === props.defaultValue) {
      searchParams.delete('tab')
    } else {
      searchParams.set('tab', newValue)
    }
    setSearchParams(searchParams, { replace: true })
  }

  return <Tabs.Root {...props} value={value} onValueChange={onValueChange} />
}
