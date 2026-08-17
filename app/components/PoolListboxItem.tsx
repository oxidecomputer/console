/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { IpVersion } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { IpVersionBadge } from '~/components/IpVersionBadge'
import { ItemLabel } from '~/ui/lib/ItemLabel'
import type { ListboxItem } from '~/ui/lib/Listbox'

/** Common fields of SiloIpPool and SiloSubnetPool used for display */
type PoolLike = {
  name: string
  isDefault: boolean
  ipVersion: IpVersion
  description: string
}

/** Format a pool for use as a ListboxField item */
export function toPoolItem(p: PoolLike): ListboxItem {
  const value = p.name
  const selectedLabel = p.name
  const label = (
    <ItemLabel
      name={
        <>
          {p.name}
          {p.isDefault && <Badge color="neutral">default</Badge>}
          <IpVersionBadge ipVersion={p.ipVersion} />
        </>
      }
    >
      {p.description}
    </ItemLabel>
  )
  return { value, selectedLabel, label }
}
