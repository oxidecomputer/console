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

export const useCustomRouterItems = () => {
  const vpcSelector = useVpcSelector()
  const { data: routers } = useApiQuery('vpcRouterList', { query: { ...vpcSelector } })
  return useMemo(() => {
    return (
      routers?.items
        .filter((item) => item.kind === 'custom')
        .map((router) => ({ value: router.name, label: router.name })) || []
    )
  }, [routers])
}
