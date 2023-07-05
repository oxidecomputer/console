/*
 * Utilities around resource roles and policies. This logic belongs in the data
 * layer and not in app/ because we are experimenting with it to decide whether
 * it belongs in the API proper.
 */
import { useMemo } from 'react'
import invariant from 'tiny-invariant'

import { lowestBy, sortBy } from '@oxide/util'

import { useApiQuery } from '.'
import type { FleetRole, IdentityType, ProjectRole, SiloRole } from './__generated__/Api'

/**
 * Union of all the specific roles, which are all the same, which makes making
 * our methods generic on the *Role type is pointless (until they stop being the same).
 * Only named `RoleName` because the API client already exports `Role`.
 */
export type RoleKey = FleetRole | SiloRole | ProjectRole

/** Turn a role order record into a sorted array of strings. */
// used for displaying lists of roles, like in a <select>
const flatRoles = (roleOrder: Record<RoleKey, number>): RoleKey[] =>
  sortBy(Object.keys(roleOrder) as RoleKey[], (role) => roleOrder[role])

// This is a record only to ensure that all RoleKey are covered
export const roleOrder: Record<RoleKey, number> = {
  admin: 0,
  collaborator: 1,
  viewer: 2,
}

/** `roleOrder` record converted to a sorted array of roles. */
export const allRoles = flatRoles(roleOrder)

/** Given a list of roles, get the most permissive one */
export const getEffectiveRole = (roles: RoleKey[]): RoleKey | undefined =>
  lowestBy(roles, (role) => roleOrder[role])

////////////////////////////
// Policy helpers
////////////////////////////

type RoleAssignment = {
  identityId: string
  identityType: IdentityType
  roleName: RoleKey
}
export type Policy = { roleAssignments: RoleAssignment[] }

/**
 * Returns a new updated policy. Does not modify the passed-in policy.
 */
export function updateRole(newAssignment: RoleAssignment, policy: Policy): Policy {
  const roleAssignments = policy.roleAssignments.filter(
    (ra) => ra.identityId !== newAssignment.identityId
  )
  roleAssignments.push(newAssignment)
  return { roleAssignments }
}

/**
 * Delete any role assignments for user or group ID. Returns a new updated
 * policy. Does not modify the passed-in policy.
 */
export function deleteRole(identityId: string, policy: Policy): Policy {
  const roleAssignments = policy.roleAssignments.filter(
    (ra) => ra.identityId !== identityId
  )
  return { roleAssignments }
}

type UserAccessRow = {
  id: string
  identityType: IdentityType
  name: string
  roleName: RoleKey
  roleSource: string
}

/**
 * Role assignments come from the API in (user, role) pairs without display
 * names and without info about which resource the role came from. This tags
 * each row with that info. It has to be a hook because it depends on the result
 * of an API request for the list of users. It's a bit awkward, but the logic is
 * identical between projects and orgs so it is worth sharing.
 */
export function useUserRows(
  roleAssignments: RoleAssignment[] | undefined,
  roleSource: string
): UserAccessRow[] {
  // HACK: because the policy has no names, we are fetching ~all the users,
  // putting them in a dictionary, and adding the names to the rows
  const { data: users } = useApiQuery('userList', {})
  const { data: groups } = useApiQuery('groupList', {})
  invariant(users, 'users should be prefetched in a loader')
  invariant(groups, 'groups should be prefetched in a loader')
  return useMemo(() => {
    const userItems = users?.items || []
    const groupItems = groups?.items || []
    const usersDict = Object.fromEntries(userItems.concat(groupItems).map((u) => [u.id, u]))
    return (roleAssignments || []).map((ra) => ({
      id: ra.identityId,
      identityType: ra.identityType,
      name: usersDict[ra.identityId]?.displayName || '', // placeholder until we get names, obviously
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
export function useActorsNotInPolicy(
  // allow undefined because this is fetched with RQ
  policy: Policy | undefined
): Actor[] {
  const { data: users } = useApiQuery('userList', {})
  const { data: groups } = useApiQuery('groupList', {})
  return useMemo(() => {
    // IDs are UUIDs, so no need to include identity type in set value to disambiguate
    const actorsInPolicy = new Set(policy?.roleAssignments.map((ra) => ra.identityId) || [])
    const allGroups = (groups?.items || []).map((g) => ({
      ...g,
      identityType: 'silo_group' as IdentityType,
    }))
    const allUsers = (users?.items || []).map((u) => ({
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
  policies: Policy[]
): RoleKey | null {
  const myIds = new Set([user.id, ...groups.map((g) => g.id)])
  const myRoles = policies
    .flatMap((p) => p.roleAssignments) // concat all the role assignments together
    .filter((ra) => myIds.has(ra.identityId))
    .map((ra) => ra.roleName)
  return getEffectiveRole(myRoles) || null
}
