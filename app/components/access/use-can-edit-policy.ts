/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  getEffectiveRole,
  scopedRoleEntries,
  type AccessScope,
  type Policy,
  type ScopedRoleEntry,
} from '@oxide/api'

import { useCurrentUser } from '~/hooks/use-current-user'

/**
 * Whether the current user can edit role assignments in the managed scope:
 * the project when a project policy is given, otherwise the silo.
 *
 * Silo modify can come from fleet roles that aren't visible in the silo
 * policy, so use `siloAdmin` from /v1/me, which Nexus computes as this
 * permission. Project modify comes from project admin or silo
 * collaborator/admin. Fleet roles don't cascade to projects.
 * https://github.com/oxidecomputer/omicron/blob/26f5e91/nexus/auth/src/authz/omicron.polar#L140-L223
 */
export function useCanEditPolicy(siloPolicy: Policy, projectPolicy?: Policy): boolean {
  const { me, myGroups } = useCurrentUser()
  if (!projectPolicy) return me.siloAdmin
  const entries = scopedRoleEntries(me.id, myGroups.items, siloPolicy, projectPolicy)
  return canEditScope(entries, 'project')
}

/**
 * Whether these role entries alone grant permission to edit the scope's roles.
 * For the silo this misses fleet-derived permission (see above), so it can
 * return false for a user who can in fact edit.
 */
export function canEditScope(entries: ScopedRoleEntry[], scope: AccessScope): boolean {
  const roleInScope = (s: AccessScope) =>
    getEffectiveRole(entries.filter((e) => e.scope === s).map((e) => e.roleName))
  const siloRole = roleInScope('silo')
  if (scope === 'silo') return siloRole === 'admin'
  return (
    roleInScope('project') === 'admin' ||
    siloRole === 'admin' ||
    siloRole === 'collaborator'
  )
}
