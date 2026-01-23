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

import { Radio } from '~/ui/lib/Radio'

import { toIpPoolItem } from './ip-pool-item'
import { ListboxField } from './ListboxField'

type IpPoolSelectorProps = {
  control: Control<any>
  poolFieldName: string
  ipVersionFieldName: string
  pools: SiloIpPool[]
  /** Current value of the pool field - used to determine radio selection */
  currentPool: string | undefined
  /** Current value of the IP version field - used to determine radio selection */
  currentIpVersion: IpVersion
  /** Function to update form values */
  setValue: UseFormSetValue<any>
  disabled?: boolean
  /**
   * Compatible IP versions based on network interface type
   * If not provided, both v4 and v6 are allowed
   */
  compatibleVersions?: IpVersion[]
}

/**
 * IP Pool selector with radio button pattern:
 * - "IPv4 default" (if v4 default exists and is compatible)
 * - "IPv6 default" (if v6 default exists and is compatible)
 * - "Use custom pool" (with pool dropdown)
 */
export function IpPoolSelector({
  control,
  poolFieldName,
  ipVersionFieldName,
  pools,
  currentPool,
  currentIpVersion,
  setValue,
  disabled = false,
  compatibleVersions,
}: IpPoolSelectorProps) {
  // Determine which default pool versions exist
  const hasV4Default = pools.some((p) => p.isDefault && p.ipVersion === 'v4')
  const hasV6Default = pools.some((p) => p.isDefault && p.ipVersion === 'v6')

  // Filter default options by compatible versions
  // undefined = no filtering, [] = filter out everything
  const showV4Default =
    hasV4Default && (!compatibleVersions || compatibleVersions.includes('v4'))
  const showV6Default =
    hasV6Default && (!compatibleVersions || compatibleVersions.includes('v6'))

  // Filter pools by compatible versions for custom pool dropdown
  const filteredPools = compatibleVersions
    ? pools.filter((p) => compatibleVersions.includes(p.ipVersion))
    : pools

  // Derive current selection, ensuring it maps to a rendered option
  type SelectionType = 'v4-default' | 'v6-default' | 'custom'
  let currentSelection: SelectionType

  if (currentPool && filteredPools.some((p) => p.name === currentPool)) {
    // Valid custom pool selected
    currentSelection = 'custom'
  } else if (!currentPool && currentIpVersion === 'v6' && showV6Default) {
    // v6 default requested and available
    currentSelection = 'v6-default'
  } else if (!currentPool && showV4Default) {
    // v4 default (explicit or fallback)
    currentSelection = 'v4-default'
  } else if (showV6Default) {
    // Fallback to v6 default
    currentSelection = 'v6-default'
  } else if (filteredPools.length > 0) {
    // Fallback to custom
    currentSelection = 'custom'
  } else {
    // No options available - pick v4-default as safe default
    currentSelection = 'v4-default'
  }

  const radioName = `pool-selection-type-${poolFieldName}`

  // Auto-correct form state when compatibility filtering changes the selection
  useEffect(() => {
    if (currentSelection === 'v4-default' && (currentPool || currentIpVersion !== 'v4')) {
      setValue(poolFieldName, '')
      setValue(ipVersionFieldName, 'v4')
    } else if (
      currentSelection === 'v6-default' &&
      (currentPool || currentIpVersion !== 'v6')
    ) {
      setValue(poolFieldName, '')
      setValue(ipVersionFieldName, 'v6')
    } else if (currentSelection === 'custom' && !currentPool && filteredPools.length > 0) {
      // Fell back to custom but no pool selected
      setValue(poolFieldName, filteredPools[0].name)
    }
  }, [
    currentSelection,
    currentPool,
    currentIpVersion,
    filteredPools,
    poolFieldName,
    ipVersionFieldName,
    setValue,
  ])

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sans-md mb-2">Select IP pool</legend>
        <div className="flex flex-col space-y-2">
          {showV4Default && (
            <Radio
              name={radioName}
              value="v4-default"
              checked={currentSelection === 'v4-default'}
              onChange={() => {
                setValue(poolFieldName, '')
                setValue(ipVersionFieldName, 'v4')
              }}
              disabled={disabled}
            >
              IPv4 default
            </Radio>
          )}
          {showV6Default && (
            <Radio
              name={radioName}
              value="v6-default"
              checked={currentSelection === 'v6-default'}
              onChange={() => {
                setValue(poolFieldName, '')
                setValue(ipVersionFieldName, 'v6')
              }}
              disabled={disabled}
            >
              IPv6 default
            </Radio>
          )}
          <Radio
            name={radioName}
            value="custom"
            checked={currentSelection === 'custom'}
            onChange={() => {
              // Set to first compatible pool in list so the dropdown shows with a valid selection
              if (filteredPools.length > 0) {
                setValue(poolFieldName, filteredPools[0].name)
              }
            }}
            disabled={disabled}
          >
            custom pool
          </Radio>
        </div>
      </fieldset>

      {currentSelection === 'custom' && (
        <ListboxField
          name={poolFieldName}
          items={filteredPools.map(toIpPoolItem)}
          label="IP pool"
          control={control}
          placeholder="Select a pool"
          required
          disabled={disabled}
        />
      )}
    </div>
  )
}
