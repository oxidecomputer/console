/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo } from 'react'

import { useApiQuery } from '~/api'
import { useVpcSelector } from '~/hooks/use-params'

/**
 * Special value indicating no router. Must use helper functions to convert
 * `undefined` to this when populating form, and this back to `undefined` in
 * onSubmit.
 */
const NO_ROUTER = '||no router||'

/** Convert form value to value for PUT body */
export function customRouterFormToData(value: string): string | undefined {
  return value === NO_ROUTER ? undefined : value
}

/** Convert value from response body to form value */
export function customRouterDataToForm(value: string | undefined): string {
  return value || NO_ROUTER
}

export const useCustomRouterItems = () => {
  const vpcSelector = useVpcSelector()
  const { data, isLoading } = useApiQuery('vpcRouterList', { query: vpcSelector })

  const routerItems = useMemo(() => {
    const items = (data?.items || [])
      .filter((item) => item.kind === 'custom')
      .map((router) => ({ value: router.id, label: router.name }))

    return [{ value: NO_ROUTER, label: 'None' }, ...items]
  }, [data])

  return { isLoading, items: routerItems }
}
