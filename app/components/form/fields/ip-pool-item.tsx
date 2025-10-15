/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Badge } from '@oxide/design-system/ui'

import type { SiloIpPool } from '~/api'

export function toIpPoolItem(p: SiloIpPool) {
  const value = p.name
  const selectedLabel = p.name
  const label = (
    <div className="flex flex-col gap-1">
      <div>
        {p.name}
        {p.isDefault && (
          <Badge className="ml-1.5" color="neutral">
            default
          </Badge>
        )}
      </div>
      {!!p.description && (
        <div className="text-secondary selected:text-accent-secondary">{p.description}</div>
      )}
    </div>
  )
  return { value, selectedLabel, label }
}
