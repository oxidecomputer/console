/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useMemo } from 'react'
import type { Control } from 'react-hook-form'
import * as R from 'remeda'

import {
  poolHasIpVersion,
  type IpVersion,
  type SiloIpPool,
  type UnicastIpPool,
} from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { IpVersionBadge } from '~/components/IpVersionBadge'

import { ListboxField } from './ListboxField'

function toIpPoolItem(p: SiloIpPool) {
  const value = p.name
  const selectedLabel = p.name
  const label = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {p.name}
        {p.isDefault && <Badge color="neutral">default</Badge>}
        <IpVersionBadge ipVersion={p.ipVersion} />
      </div>
      {!!p.description && (
        <div className="text-secondary selected:text-accent-secondary">{p.description}</div>
      )}
    </div>
  )
  return { value, selectedLabel, label }
}

const ALL_IP_VERSIONS: IpVersion[] = ['v4', 'v6']

type IpPoolSelectorProps = {
  className?: string
  control: Control<any>
  poolFieldName: string
  pools: UnicastIpPool[]
  disabled?: boolean
  /** Compatible IP versions based on network interface type */
  compatibleVersions?: IpVersion[]
  required?: boolean
}

export function IpPoolSelector({
  className,
  control,
  poolFieldName,
  pools,
  disabled = false,
  compatibleVersions = ALL_IP_VERSIONS,
  required = true,
}: IpPoolSelectorProps) {
  // Note: pools are already filtered by poolType before being passed to this component
  const sortedPools = useMemo(() => {
    const compatPools = pools.filter(poolHasIpVersion(compatibleVersions))
    return R.sortBy(
      compatPools,
      (p) => !p.isDefault, // false sorts first, so this defaults first
      (p) => p.ipVersion, // sort v4 first
      (p) => p.name
    )
  }, [pools, compatibleVersions])

  return (
    <div className={cn('space-y-4', className)}>
      <ListboxField
        name={poolFieldName}
        items={sortedPools.map(toIpPoolItem)}
        label="Pool"
        noItemsPlaceholder="No pools available"
        control={control}
        placeholder="Select a pool"
        required={required}
        disabled={disabled}
      />
    </div>
  )
}
