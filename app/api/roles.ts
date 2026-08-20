/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/*
 * Utilities around resource roles and policies. This logic belongs in the data
 * layer and not in app/ because we are experimenting with it to decide whether
 * it belongs in the API proper.
 */
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as R from 'remeda'

import { ALL_ISH } from '~/util/consts'

import type {
  FleetRole,
  Group,
  IdentityType,
  ProjectRole,
  SiloRole,
} from './__generated__/Api'
import { api, q, usePrefetchedQuery } from './client'

/**
 * Union of all the specific roles, which used to all be the same until we added
 * limited collaborator to silo.
 */
export type RoleKey = FleetRole | SiloRole | ProjectRole

/** Turn a role order record into a sorted array of strings. */
// used for displaying lists of roles, like in a <select>
const flatRoles = (roleOrder: Record<RoleKey, number>): RoleKey[] =>
  R.sortBy(Object.keys(roleOrder) as RoleKey[], (role) => roleOrder[role])

// This is a record only to ensure that all RoleKey are covered. weird order
// on purpose so allRoles test can confirm sorting works
export const roleOrder: Record<RoleKey, number> = {
  collaborator: 1,
  admin: 0,
  viewer: 3,
  limited_collaborator: 2,
}

/** `roleOrder` record converted to a sorted array of roles. */
export const allRoles = flatRoles(roleOrder)

// Fleet roles don't include limited_collaborator
export const fleetRoles = allRoles.filter(
  (r): r is FleetRole => r !== 'limited_collaborator'
)

/** Given a list of roles, get the most permissive one */
export const getEffectiveRole = <Role extends RoleKey>(roles: Role[]): Role | undefined =>
  R.firstBy(roles, (role) => roleOrder[role])

////////////////////////////
// Policy helpers
////////////////////////////

type RoleAssignment<Role extends RoleKey = RoleKey> = {
  identityId: string
  identityType: IdentityType
  roleName: Role
}
export type Policy<Role extends RoleKey = RoleKey> = {
  roleAssignments: RoleAssignment<Role>[]
}

/**
 * Returns a new updated policy. Does not modify the passed-in policy.
 */
export function updateRole<Role extends RoleKey>(
  newAssignment: RoleAssignment<Role>,
  policy: Policy<Role>
): Policy<Role> {
  const roleAssignments = policy.roleAssignments.filter(
    (ra) => ra.identityId !== newAssignment.identityId
  )
  roleAssignments.push(newAssignment)
  return { roleAssignments }
}

/**
 * Map from identity ID to role name for quick lookup. If an actor has multiple
 * assignments in the same policy (which the API allows) take the strongest one.
 */
export function rolesByIdFromPolicy<Role extends RoleKey>(
  policy: Policy<Role>
): Map<string, Role> {
  const map = new Map<string, Role>()
  for (const { identityId, roleName } of policy.roleAssignments) {
    const existing = map.get(identityId)
    // non-null: list is non-empty
    map.set(identityId, getEffectiveRole(existing ? [existing, roleName] : [roleName])!)
  }
  return map
}

/**
 * Delete any role assignments for user or group ID. Returns a new updated
 * policy. Does not modify the passed-in policy.
 */
export function deleteRole<Role extends RoleKey>(
  identityId: string,
  policy: Policy<Role>
): Policy<Role> {
  const roleAssignments = policy.roleAssignments.filter(
    (ra) => ra.identityId !== identityId
  )
  return { roleAssignments }
}

type SortableUserRow = { identityType: IdentityType; name: string }

/**
 * Comparator for array sort. Group groups and users, then sort by name within
 * groups and within users.
 */
export function byGroupThenName(a: SortableUserRow, b: SortableUserRow) {
  const aGroup = Number(a.identityType === 'silo_group')
  const bGroup = Number(b.identityType === 'silo_group')
  return bGroup - aGroup || a.name.localeCompare(b.name)
}

export type Actor = {
  identityType: IdentityType
  displayName: string
  id: string
}

/**
 * Fetch lists of users and groups, filtering out the ones that are already in
 * the given policy.
 */
export function useActorsNotInPolicy<Role extends RoleKey = RoleKey>(
  policy: Policy<Role>
): Actor[] {
  const { data: users } = usePrefetchedQuery(q(api.userList, { query: { limit: ALL_ISH } }))
  const { data: groups } = usePrefetchedQuery(
    q(api.groupList, { query: { limit: ALL_ISH } })
  )
  return useMemo(() => {
    // IDs are UUIDs, so no need to include identity type in set value to disambiguate
    const actorsInPolicy = new Set(policy?.roleAssignments.map((ra) => ra.identityId) || [])
    // groups first, then users; each sorted alphabetically by display name
    const allGroups = R.sortBy(
      groups.items.map((g) => ({ ...g, identityType: 'silo_group' as IdentityType })),
      (g) => g.displayName.toLowerCase()
    )
    const allUsers = R.sortBy(
      users.items.map((u) => ({ ...u, identityType: 'silo_user' as IdentityType })),
      (u) => u.displayName.toLowerCase()
    )
    return allGroups.concat(allUsers).filter((u) => !actorsInPolicy.has(u.id))
  }, [users, groups, policy])
}

export type AccessScope = 'silo' | 'project'

export type ScopedRoleEntry = {
  roleName: RoleKey
  scope: AccessScope
  source: { type: 'direct' } | { type: 'group'; group: { id: string; displayName: string } }
}

/**
 * Enumerate all role assignments relevant to a user — one entry per direct
 * assignment and one per group assignment — across the given policies. Each
 * entry is tagged with the scope of the policy it came from. Since the API
 * permits multiple assignments for the same identity in one policy, each entry
 * collapses those to the strongest role (see `getEffectiveRole`).
 * Callers are responsible for sorting and any display-layer merging.
 */
export function userScopedRoleEntries(
  userId: string,
  userGroups: { id: string; displayName: string }[],
  siloPolicy: Policy,
  projectPolicy?: Policy
): ScopedRoleEntry[] {
  const entries = policyRoleEntries('silo', siloPolicy, userId, userGroups)
  if (projectPolicy) {
    entries.push(...policyRoleEntries('project', projectPolicy, userId, userGroups))
  }
  return entries
}

function policyRoleEntries(
  scope: AccessScope,
  policy: Policy,
  userId: string,
  userGroups: { id: string; displayName: string }[]
): ScopedRoleEntry[] {
  const roleById = rolesByIdFromPolicy(policy)
  const entries: ScopedRoleEntry[] = []
  const direct = roleById.get(userId)
  if (direct) {
    entries.push({ roleName: direct, scope, source: { type: 'direct' } })
  }
  for (const group of userGroups) {
    const via = roleById.get(group.id)
    if (via) {
      entries.push({ roleName: via, scope, source: { type: 'group', group } })
    }
  }
  return entries
}

/** Sort role entries strongest first (see `roleOrder`), so the effective role leads. */
export const sortRoleEntries = (entries: ScopedRoleEntry[]) =>
  R.sortBy(entries, (e) => roleOrder[e.roleName])

/**
 * Builds a map from user ID to the list of groups that user belongs to,
 * firing one query per group to fetch members. Shared between user tabs.
 */
export function useGroupsByUserId(groups: Group[]): Map<string, Group[]> {
  const groupMemberPages = useQueries({
    queries: groups.map((g) => q(api.userList, { query: { group: g.id, limit: ALL_ISH } })),
    // useQueries returns a new array each render; combine structurally shares
    // the selected data so the Map only changes with groups or memberships
    combine: (results) => results.map((result) => result.data),
  })

  return useMemo(() => {
    const map = new Map<string, Group[]>()
    groups.forEach((group, i) => {
      const members = groupMemberPages[i]?.items ?? []
      members.forEach((member) => {
        const existing = map.get(member.id)
        if (existing) existing.push(group)
        else map.set(member.id, [group])
      })
    })
    return map
  }, [groups, groupMemberPages])
}
