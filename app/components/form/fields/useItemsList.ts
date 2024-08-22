/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo } from 'react'

import { useApiQuery } from '~/api'
import { useVpcSelector } from '~/hooks'

/**
 * Special value indicating no router. Must convert `undefined` to this when
 * populating form, and must convert this to `undefined` in onSubmit.
 */
export const NO_ROUTER = '||no router||'

export const useCustomRouterItems = () => {
  const vpcSelector = useVpcSelector()
  const { data, isLoading } = useApiQuery('vpcRouterList', { query: { ...vpcSelector } })

  const routerItems = useMemo(() => {
    const items = (data?.items || [])
      .filter((item) => item.kind === 'custom')
      .map((router) => ({ value: router.id, label: router.name }))

    return [{ value: NO_ROUTER, label: 'None' }, ...items]
  }, [data])

  return { isLoading, items: routerItems }
}
