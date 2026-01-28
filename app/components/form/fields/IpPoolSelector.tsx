/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import type { Control, UseFormSetValue } from 'react-hook-form'

import type { IpVersion, SiloIpPool } from '@oxide/api'

import { toIpPoolItem } from './ip-pool-item'
import { ListboxField } from './ListboxField'

type IpPoolSelectorProps = {
  control: Control<any>
  poolFieldName: string
  ipVersionFieldName: string
  pools: SiloIpPool[]
  /** Current value of the pool field */
  currentPool: string | undefined
  /** Function to update form values */
  setValue: UseFormSetValue<any>
  disabled?: boolean
  /**
   * Compatible IP versions based on network interface type
   * If not provided, both v4 and v6 are allowed
   */
  compatibleVersions?: IpVersion[]
}

export function IpPoolSelector({
  control,
  poolFieldName,
  ipVersionFieldName,
  pools,
  currentPool,
  setValue,
  disabled = false,
  compatibleVersions,
}: IpPoolSelectorProps) {
  // Filter pools by compatible versions
  const filteredPools = compatibleVersions
    ? pools.filter((p) => compatibleVersions.includes(p.ipVersion))
    : pools

  // Sort pools: v4 default first, then v6 default, then others alphabetically
  const sortedPools = [...filteredPools].sort((a, b) => {
    // v4 default goes first
    if (a.isDefault && a.ipVersion === 'v4') return -1
    if (b.isDefault && b.ipVersion === 'v4') return 1

    // v6 default goes second
    if (a.isDefault && a.ipVersion === 'v6') return -1
    if (b.isDefault && b.ipVersion === 'v6') return 1

    // All others sorted alphabetically by name
    return a.name.localeCompare(b.name)
  })

  const hasNoPools = filteredPools.length === 0

  // Set default pool selection on mount if none selected, or if current pool is no longer valid
  useEffect(() => {
    if (sortedPools.length > 0) {
      const currentPoolValid = currentPool && sortedPools.some((p) => p.name === currentPool)

      if (!currentPoolValid) {
        // Use the first pool in the sorted list (which will be a default if one exists)
        const defaultPool = sortedPools[0]
        setValue(poolFieldName, defaultPool.name)
        setValue(ipVersionFieldName, defaultPool.ipVersion)
      }
    }
  }, [currentPool, sortedPools, poolFieldName, ipVersionFieldName, setValue])

  // Update IP version when pool changes
  useEffect(() => {
    if (currentPool) {
      const selectedPool = sortedPools.find((p) => p.name === currentPool)
      if (selectedPool) {
        setValue(ipVersionFieldName, selectedPool.ipVersion)
      }
    }
  }, [currentPool, sortedPools, ipVersionFieldName, setValue])

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
