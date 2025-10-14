/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { usePrefetchedApiQuery } from '@oxide/api'
import { Cloud24Icon, NextArrow12Icon } from '@oxide/design-system/icons/react'

import { useSiloSelector } from '~/hooks/use-params'
import { Badge } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'

export default function SiloFleetRolesTab() {
  const siloSelector = useSiloSelector()
  const { data: silo } = usePrefetchedApiQuery('siloView', { path: siloSelector })

  const roleMapPairs = Object.entries(silo.mappedFleetRoles).flatMap(
    ([fleetRole, siloRoles]) =>
      siloRoles.map((siloRole) => [siloRole, fleetRole] as [string, string])
  )

  if (roleMapPairs.length === 0) {
    return (
      <TableEmptyBox>
        <EmptyMessage
          icon={<Cloud24Icon />}
          title="Mapped fleet roles"
          // TODO: better empty state explaining that no roles are mapped so nothing will happen
          body="Silo roles can automatically grant a fleet role. This silo has no role mappings configured."
        />
      </TableEmptyBox>
    )
  }

  return (
    <>
      <p className="mb-4 text-default">Silo roles can automatically grant a fleet role.</p>
      <ul className="space-y-3">
        {roleMapPairs.map(([siloRole, fleetRole]) => (
          <li key={siloRole + '|' + fleetRole} className="flex items-center">
            <Badge>Silo {siloRole}</Badge>
            <NextArrow12Icon className="mx-3 text-default" aria-label="maps to" />
            <span className="text-sans-md text-default">Fleet {fleetRole}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
