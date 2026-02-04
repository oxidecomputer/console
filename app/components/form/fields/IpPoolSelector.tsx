/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import type { Control } from 'react-hook-form'
import * as R from 'remeda'

import { poolHasIpVersion, type IpVersion, type UnicastIpPool } from '@oxide/api'

import { toIpPoolItem } from './ip-pool-item'
import { ListboxField } from './ListboxField'

const ALL_IP_VERSIONS: IpVersion[] = ['v4', 'v6']

type IpPoolSelectorProps = {
  control: Control<any>
  poolFieldName: string
  pools: UnicastIpPool[]
  disabled?: boolean
  /** Compatible IP versions based on network interface type */
  compatibleVersions?: IpVersion[]
}

export function IpPoolSelector({
  control,
  poolFieldName,
  pools,
  disabled = false,
  compatibleVersions = ALL_IP_VERSIONS,
}: IpPoolSelectorProps) {
  // Note: pools are already filtered by poolType before being passed to this component
  const sortedPools = useMemo(() => {
    const compatPools = pools.filter(poolHasIpVersion(compatibleVersions))
    // sort defaults first, sort v4 first, then name as tiebreaker
    return R.sortBy(compatPools, (p) => [!p.isDefault, p.ipVersion, p.name])
  }, [pools, compatibleVersions])

  const hasNoPools = sortedPools.length === 0

  return (
    <div className="space-y-4">
      {hasNoPools ? (
        <div className="text-secondary">
          No IP pools available for this network interface type
        </div>
      ) : (
        <ListboxField
          name={poolFieldName}
          items={sortedPools.map(toIpPoolItem)}
          label={'Pool'}
          control={control}
          placeholder="Select a pool"
          required
          disabled={disabled}
        />
      )}
    </div>
  )
}
