/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { SiloIpPool } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { IpVersionBadge } from '~/components/IpVersionBadge'
import type { ListboxItem } from '~/ui/lib/Listbox'

/** Format a SiloIpPool for use as a ListboxField item */
export function toIpPoolItem(p: SiloIpPool): ListboxItem {
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
