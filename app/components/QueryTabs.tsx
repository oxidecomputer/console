import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SetRequired } from 'type-fest'

import { Tabs } from '@oxide/ui'

type QueryTabsProps = SetRequired<
  React.ComponentPropsWithoutRef<typeof Tabs.Root>,
  'defaultValue'
>

/**
 * Use instead of `Tabs.Root` to sync current tab with arg in URL query string.
 *
 * If you don't want the query arg functionality, e.g., if you have multiple
 * sets of tabs on the same page, use `Tabs.Root` directly.
 */
export function QueryTabs(props: QueryTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const valueFromParams = searchParams.get('tab')

  const [value, setValue] = useState(valueFromParams || props.defaultValue)

  function onValueChange(newValue: string) {
    if (newValue === props.defaultValue) {
      searchParams.delete('tab')
    } else {
      searchParams.set('tab', newValue)
    }
    setSearchParams(searchParams, { replace: true })
    setValue(newValue)
  }

  return <Tabs.Root {...props} value={value} onValueChange={onValueChange} />
}
