/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useMemo } from 'react'
import type { Control, UseFormSetValue } from 'react-hook-form'

import { getCompatiblePools, type IpVersion, type SiloIpPool } from '@oxide/api'

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
  /**
   * If true, automatically select a default pool when none is selected.
   * If false, allow the field to remain empty to use API defaults.
   * Default to false, to allow API to manage defaults / not send explicit values.
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
  compatibleVersions,
  autoSelectDefault = false,
}: IpPoolSelectorProps) {
  // Note: pools are already filtered by poolType before being passed to this component
  const sortedPools = useMemo(() => {
    return getCompatiblePools(pools, compatibleVersions).sort((a, b) => {
      if (a.isDefault && a.ipVersion === 'v4') return -1
      if (b.isDefault && b.ipVersion === 'v4') return 1

      if (a.isDefault && a.ipVersion === 'v6') return -1
      if (b.isDefault && b.ipVersion === 'v6') return 1

      return a.name.localeCompare(b.name)
    })
  }, [pools, compatibleVersions])

  const hasNoPools = sortedPools.length === 0

  // Set default pool selection on mount if none selected, or if current pool is no longer valid
  useEffect(() => {
    if (sortedPools.length > 0 && autoSelectDefault) {
      const currentPoolValid =
        currentPool && sortedPools.some((p) => p.name === currentPool)

      // Only auto-select when there's an actual default pool
      const defaultPool = sortedPools.find((p) => p.isDefault)

      if (!currentPoolValid && defaultPool) {
        setValue(poolFieldName, defaultPool.name)
        setValue(ipVersionFieldName, defaultPool.ipVersion)
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
