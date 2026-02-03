/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useMemo } from 'react'
import type { Control, UseFormSetValue } from 'react-hook-form'
import * as R from 'remeda'

import { poolHasIpVersion, type IpVersion, type UnicastIpPool } from '@oxide/api'

import { toIpPoolItem } from './ip-pool-item'
import { ListboxField } from './ListboxField'

type IpPoolSelectorProps = {
  control: Control<any>
  poolFieldName: string
  ipVersionFieldName: string
  pools: UnicastIpPool[]
  /** Current value of the pool field */
  currentPool: string | undefined
  /** Function to update form values */
  setValue: UseFormSetValue<any>
  disabled?: boolean
  /** Compatible IP versions based on network interface type */
  compatibleVersions?: IpVersion[]
  /**
   * If true, automatically select a default pool when none is selected.
   * If false, allow the field to remain empty to use API defaults.
   * Default to true, to automatically select a default pool if available.
   */
  autoSelectDefault?: boolean
}

export function IpPoolSelector({
  control,
  poolFieldName,
  ipVersionFieldName,
  pools,
  currentPool,
  setValue,
  disabled = false,
  compatibleVersions = ['v4', 'v6'],
  // When both a default IPv4 and default IPv6 pool exist, the component picks the
  // v4 default, to reduce user confusion. The selection is easily modified later
  // (both in the form and later on the instance).
  autoSelectDefault = true,
}: IpPoolSelectorProps) {
  // Note: pools are already filtered by poolType before being passed to this component
  const sortedPools = useMemo(() => {
    const compatPools = pools.filter(poolHasIpVersion(compatibleVersions))
    // sort defaults first, sort v4 first, then name as tiebreaker
    return R.sortBy(compatPools, (p) => [!p.isDefault, p.ipVersion, p.name])
  }, [pools, compatibleVersions])

  const hasNoPools = sortedPools.length === 0

  // Set default pool selection on mount if none selected, or if current pool is no longer valid
  useEffect(() => {
    if (sortedPools.length > 0 && autoSelectDefault) {
      const currentPoolValid =
        currentPool && sortedPools.some((p) => p.name === currentPool)

      if (!currentPoolValid) {
        // Only auto-select when there's an actual default pool
        const defaultPool = sortedPools.find((p) => p.isDefault)

        if (defaultPool) {
          setValue(poolFieldName, defaultPool.name)
          setValue(ipVersionFieldName, defaultPool.ipVersion)
        } else {
          // Clear selection when current pool is invalid and no compatible default exists
          setValue(poolFieldName, '')
        }
      }
    }
  }, [
    currentPool,
    sortedPools,
    poolFieldName,
    ipVersionFieldName,
    setValue,
    autoSelectDefault,
  ])

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
          placeholder={autoSelectDefault ? 'Select a pool' : 'Use default pool'}
          required={autoSelectDefault}
          disabled={disabled}
        />
      )}
    </div>
  )
}
