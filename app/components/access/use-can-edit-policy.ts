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
  type FleetRolePolicy,
  type Policy,
  type ScopedPolicy,
} from '@oxide/api'

import { useCurrentUser } from '~/hooks/use-current-user'

/**
 * Whether the current user can add, change, or remove role assignments in the
 * managed scope. Editing a scope's policy requires `modify` on that resource:
 * silo modify comes from the silo admin role; project modify comes from the
 * project admin role or a silo collaborator/admin role (a silo collaborator is
 * an admin on every project in the silo).
 *
 * Fleet roles also grant modify, but they aren't present in these policies, so a
 * fleet admin/collaborator may see actions disabled here that would in fact
 * succeed. That's the same limitation the access pages have always had.
 * https://github.com/oxidecomputer/omicron/blob/main/nexus/auth/src/authz/omicron.polar
 */
export function useCanEditPolicy(
  scopedPolicies: ScopedPolicy[],
  managedScope: AccessScope
): boolean {
  const { me, myGroups } = useCurrentUser()
  const entries = userScopedRoleEntries(me.id, myGroups.items, scopedPolicies)
  const roleInScope = (scope: AccessScope) =>
    getEffectiveRole(entries.filter((e) => e.scope === scope).map((e) => e.roleName))
  const siloRole = roleInScope('silo')
  return managedScope === 'silo'
    ? siloRole === 'admin'
    : roleInScope('project') === 'admin' ||
        siloRole === 'admin' ||
        siloRole === 'collaborator'
}

/** `useCanEditPolicy` for the silo-only tabs, which have no scope machinery. */
export function useCanEditSiloPolicy(siloPolicy: Policy): boolean {
  return useCanEditPolicy([{ scope: 'silo', policy: siloPolicy }], 'silo')
}

/**
 * Whether the current user can add, change, or remove fleet role assignments.
 * Modifying the fleet policy requires the fleet admin role. Fleet is the
 * top-level resource, so unlike project there's no collaborator cascade — only
 * admin confers modify.
 * https://github.com/oxidecomputer/omicron/blob/main/nexus/auth/src/authz/omicron.polar
 */
export function useCanEditFleetPolicy(policy: FleetRolePolicy): boolean {
  const { me, myGroups } = useCurrentUser()
  const myIds = new Set([me.id, ...myGroups.items.map((g) => g.id)])
  const myFleetRole = getEffectiveRole(
    policy.roleAssignments.filter((ra) => myIds.has(ra.identityId)).map((ra) => ra.roleName)
  )
  return myFleetRole === 'admin'
}
