/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { CellContext } from '@tanstack/react-table'

import type { RoleKey } from '@oxide/api'

import { Tooltip } from '~/ui/lib/Tooltip'

import { AccessBadge } from './AccessBadge'

/**
 * Highlight the "effective" role, providing a tooltip for the alternate role.
 *
 * Example: User has collab on silo and viewer on project. Collab supersedes
 * because it is the "stronger" role, i.e., it strictly includes the perms on
 * viewer. So collab is highlighted as the "effective" role.
 */
export const ProjectAccessRolesCell = <
  RowData extends { projectRole?: RoleKey; siloRole?: RoleKey },
>(
  info: CellContext<RowData, RoleKey>
) => {
  const effectiveRoleString = info.getValue()
  if (!effectiveRoleString) return null

  const siloRole = info.row.original.siloRole
  const formattedSiloRole = siloRole ? (
    <AccessBadge role={siloRole} labelPrefix="silo" />
  ) : undefined

  const projectRole = info.row.original.projectRole
  const formattedProjectRole = projectRole ? (
    <AccessBadge role={projectRole} labelPrefix="project" />
  ) : undefined

  const effectiveRoleIsSiloRole = effectiveRoleString === siloRole
  const effectiveRole = effectiveRoleIsSiloRole ? formattedSiloRole : formattedProjectRole
  const alternateRole = effectiveRoleIsSiloRole ? formattedProjectRole : formattedSiloRole

  return (
    <div className="flex items-baseline gap-1">
      {effectiveRole}
      {siloRole && projectRole ? (
        <Tooltip content={alternateRole} placement="top">
          <>+1</>
        </Tooltip>
      ) : undefined}
    </div>
  )
}
