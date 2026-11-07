/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  getEffectiveRole,
  userScopedRoleEntries,
  type AccessScope,
  type Policy,
  type ScopedRoleEntry,
} from '@oxide/api'

import { useCurrentUser } from '~/hooks/use-current-user'

/**
 * Whether the current user can add, change, or remove role assignments in the
 * managed scope: the project when a project policy is given, otherwise the
 * silo. Editing a scope's policy requires `modify` on that resource.
 *
 * Silo modify can come from fleet roles, including ones conferred through a
 * silo's `mapped_fleet_roles`, which aren't visible in the silo policy. Nexus
 * computes `siloAdmin` on /v1/me as exactly this permission, so use it rather
 * than deriving it from policies.
 *
 * Project modify comes from the project admin role or a silo collaborator/admin
 * role (a silo collaborator is an admin on every project in the silo). Fleet
 * roles grant silo modify as a permission, not a silo role, so they don't
 * cascade to projects, and both policies are in hand to compute this.
 * https://github.com/oxidecomputer/omicron/blob/26f5e91/nexus/auth/src/authz/omicron.polar#L140-L223
 */
export function useCanEditPolicy(siloPolicy: Policy, projectPolicy?: Policy): boolean {
  const { me, myGroups } = useCurrentUser()
  if (!projectPolicy) return me.siloAdmin
  const entries = userScopedRoleEntries(me.id, myGroups.items, siloPolicy, projectPolicy)
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
