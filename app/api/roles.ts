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
import { useMemo, useRef } from 'react'
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

/** Map from identity ID to role name for quick lookup. */
export function rolesByIdFromPolicy<Role extends RoleKey>(
  policy: Policy<Role>
): Map<string, Role> {
  return new Map(policy.roleAssignments.map((a) => [a.identityId, a.roleName]))
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

type UserAccessRow<Role extends RoleKey = RoleKey> = {
  id: string
  identityType: IdentityType
  name: string
  roleName: Role
  roleSource: string
}

/**
 * Role assignments come from the API in (user, role) pairs without display
 * names and without info about which resource the role came from. This tags
 * each row with that info. It has to be a hook because it depends on the result
 * of an API request for the list of users. It's a bit awkward, but the logic is
 * identical between projects and orgs so it is worth sharing.
 */
export function useUserRows<Role extends RoleKey = RoleKey>(
  roleAssignments: RoleAssignment<Role>[],
  roleSource: string
): UserAccessRow<Role>[] {
  // HACK: because the policy has no names, we are fetching ~all the users,
  // putting them in a dictionary, and adding the names to the rows
  const { data: users } = usePrefetchedQuery(q(api.userList, {}))
  const { data: groups } = usePrefetchedQuery(q(api.groupList, {}))
  return useMemo(() => {
    const userItems = users?.items || []
    const groupItems = groups?.items || []
    const usersDict = Object.fromEntries(userItems.concat(groupItems).map((u) => [u.id, u]))
    return roleAssignments.map((ra) => ({
      id: ra.identityId,
      identityType: ra.identityType,
      // A user might not appear here if they are not in the current user's
      // silo. This could happen in a fleet policy, which might have users from
      // different silos. Hence the ID fallback. The code that displays this
      // detects when we've fallen back and includes an explanatory tooltip.
      name: usersDict[ra.identityId]?.displayName || ra.identityId,
      roleName: ra.roleName,
      roleSource,
    }))
  }, [roleAssignments, roleSource, users, groups])
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
  const { data: users } = usePrefetchedQuery(q(api.userList, {}))
  const { data: groups } = usePrefetchedQuery(q(api.groupList, {}))
  return useMemo(() => {
    // IDs are UUIDs, so no need to include identity type in set value to disambiguate
    const actorsInPolicy = new Set(policy?.roleAssignments.map((ra) => ra.identityId) || [])
    const allGroups = groups.items.map((g) => ({
      ...g,
      identityType: 'silo_group' as IdentityType,
    }))
    const allUsers = users.items.map((u) => ({
      ...u,
      identityType: 'silo_user' as IdentityType,
    }))
    // groups go before users
    return allGroups.concat(allUsers).filter((u) => !actorsInPolicy.has(u.id)) || []
  }, [users, groups, policy])
}

export function userRoleFromPolicies(
  user: { id: string },
  groups: { id: string }[],
  policy: Policy
): RoleKey | null {
  const myIds = new Set([user.id, ...groups.map((g) => g.id)])
  const myRoles = policy.roleAssignments
    .filter((ra) => myIds.has(ra.identityId))
    .map((ra) => ra.roleName)
  return getEffectiveRole(myRoles) || null
}

export type ScopedRoleEntry = {
  roleName: RoleKey
  source: { type: 'direct' } | { type: 'group'; group: { id: string; displayName: string } }
}

/**
 * Enumerate all role assignments relevant to a user — one entry per direct
 * assignment and one per group assignment — from the silo policy.
 * Callers are responsible for sorting and any display-layer merging.
 */
export function userScopedRoleEntries(
  userId: string,
  userGroups: { id: string; displayName: string }[],
  policy: Policy
): ScopedRoleEntry[] {
  const entries: ScopedRoleEntry[] = []
  const direct = policy.roleAssignments.find((ra) => ra.identityId === userId)
  if (direct) entries.push({ roleName: direct.roleName, source: { type: 'direct' } })
  for (const group of userGroups) {
    const via = policy.roleAssignments.find((ra) => ra.identityId === group.id)
    if (via) entries.push({ roleName: via.roleName, source: { type: 'group', group } })
  }
  return entries
}

/**
 * Builds a map from user ID to the list of groups that user belongs to,
 * firing one query per group to fetch members. Shared between user tabs.
 */
export function useGroupsByUserId(groups: Group[]): Map<string, Group[]> {
  const groupMemberQueries = useQueries({
    queries: groups.map((g) => q(api.userList, { query: { group: g.id, limit: ALL_ISH } })),
  })

  // Use refs to return a stable Map reference when the underlying data hasn't
  // changed. Without this, a new Map on every render causes downstream useMemos
  // to recompute continuously, which destabilizes table rows in Playwright.
  const mapRef = useRef<Map<string, Group[]>>(new Map())
  const versionRef = useRef<string>('')

  const version = [
    groups.map((g) => g.id).join(','),
    ...groupMemberQueries.map((q) => q.dataUpdatedAt),
  ].join('|')

  if (version !== versionRef.current) {
    versionRef.current = version
    const map = new Map<string, Group[]>()
    groups.forEach((group, i) => {
      const members = groupMemberQueries[i]?.data?.items ?? []
      members.forEach((member) => {
        const existing = map.get(member.id)
        if (existing) existing.push(group)
        else map.set(member.id, [group])
      })
    })
    mapRef.current = map
  }

  return mapRef.current
}
