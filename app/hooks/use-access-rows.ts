/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import * as R from 'remeda'

import {
  byGroupThenName,
  getEffectiveRole,
  roleOrder,
  type IdentityType,
  type UserAccessRow,
} from '@oxide/api'

import type { ProjectAccessRow, SiloAccessRow } from '~/types/access'
import { groupBy } from '~/util/array'

type IdentityFilter = 'all' | 'users' | 'groups'

/** Filter rows by identity type based on the filter parameter */
function filterByIdentityType<T extends { identityType: IdentityType }>(
  rows: T[],
  filter: IdentityFilter
): T[] {
  if (filter === 'users') return rows.filter((row) => row.identityType === 'silo_user')
  if (filter === 'groups') return rows.filter((row) => row.identityType === 'silo_group')
  return rows
}

export function useSiloAccessRows(
  siloRows: UserAccessRow[],
  filter: IdentityFilter = 'all'
): SiloAccessRow[] {
  return useMemo(() => {
    const rows = groupBy(siloRows, (u) => u.id).map(([userId, userAssignments]) => {
      // groupBy always produces non-empty arrays, but add guard for safety
      if (userAssignments.length === 0) {
        throw new Error(`Unexpected empty userAssignments array for userId ${userId}`)
      }

      const siloRole = userAssignments.find((a) => a.roleSource === 'silo')?.roleName
      const { name, identityType } = userAssignments[0]

      const row: SiloAccessRow = {
        id: userId,
        identityType,
        name,
        siloRole,
        // All users in silo policy have a silo role (guaranteed by API)
        effectiveRole: getEffectiveRole([siloRole!])!,
      }

      return row
    })

    return filterByIdentityType(rows, filter).sort(byGroupThenName)
  }, [siloRows, filter])
}

export function useProjectAccessRows(
  siloRows: UserAccessRow[],
  projectRows: UserAccessRow[],
  filter: IdentityFilter = 'all'
): ProjectAccessRow[] {
  return useMemo(() => {
    const rows = groupBy(siloRows.concat(projectRows), (u) => u.id).map(
      ([userId, userAssignments]) => {
        // groupBy always produces non-empty arrays, but add guard for safety
        if (userAssignments.length === 0) {
          throw new Error(`Unexpected empty userAssignments array for userId ${userId}`)
        }

        const { name, identityType } = userAssignments[0]

        const siloAccessRow = userAssignments.find((a) => a.roleSource === 'silo')
        const projectAccessRow = userAssignments.find((a) => a.roleSource === 'project')

        // Filter out undefined values, then map to expected shape
        const roleBadges = R.sortBy(
          [siloAccessRow, projectAccessRow].filter((r) => r !== undefined),
          (r) => roleOrder[r.roleName] // sorts strongest role first
        ).map((r) => ({
          roleSource: r.roleSource,
          roleName: r.roleName,
        }))

        return {
          id: userId,
          identityType,
          name,
          projectRole: projectAccessRow?.roleName,
          roleBadges,
        } satisfies ProjectAccessRow
      }
    )

    return filterByIdentityType(rows, filter).sort(byGroupThenName)
  }, [siloRows, projectRows, filter])
}
