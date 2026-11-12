/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useSearchParams } from 'react-router'

import { Tabs, type TabsRootProps } from '~/ui/lib/Tabs'

/**
 * Use instead of `Tabs.Root` to sync current tab with arg in URL query string.
 *
 * If you don't want the query arg functionality, e.g., if you have multiple
 * sets of tabs on the same page, use `Tabs.Root` directly.
 */
export function QueryParamTabs(props: TabsRootProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get('tab') || props.defaultValue

  function onValueChange(newValue: string | number | null) {
    // Copy rather than mutate: the hook's object is what we read `value` from,
    // so mutating it switches the tab on the next render, before the navigation
    // (and the loader it triggers) has committed.
    const nextParams = new URLSearchParams(searchParams)
    if (newValue === props.defaultValue) {
      nextParams.delete('tab')
    } else {
      nextParams.set('tab', String(newValue))
    }
    setSearchParams(nextParams, { replace: true })
  }

  return <Tabs.Root {...props} value={value} onValueChange={onValueChange} />
}
