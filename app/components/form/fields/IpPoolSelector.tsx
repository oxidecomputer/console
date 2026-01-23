/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
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
  // Filter pools by compatible versions for custom pool dropdown
  const filteredPools = compatibleVersions
    ? pools.filter((p) => compatibleVersions.includes(p.ipVersion))
    : pools

  // Determine which default pool versions exist
  const hasV4Default = pools.some((p) => p.isDefault && p.ipVersion === 'v4')
  const hasV6Default = pools.some((p) => p.isDefault && p.ipVersion === 'v6')

  // Filter default options by compatible versions
  const showV4Default =
    hasV4Default && (!compatibleVersions || compatibleVersions.includes('v4'))
  const showV6Default =
    hasV6Default && (!compatibleVersions || compatibleVersions.includes('v6'))

  // Derive current selection from pool and ipVersion
  type SelectionType = 'v4-default' | 'v6-default' | 'custom'
  const currentSelection: SelectionType = currentPool
    ? 'custom'
    : currentIpVersion === 'v6'
      ? 'v6-default'
      : 'v4-default'

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sans-md mb-2">Select IP pool</legend>
        <div className="flex flex-col space-y-2">
          {showV4Default && (
            <Radio
              name="pool-selection-type"
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
              name="pool-selection-type"
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
            name="pool-selection-type"
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
          control={control}
          placeholder="Select a pool"
          required
          disabled={disabled}
        />
      )}
    </div>
  )
}
