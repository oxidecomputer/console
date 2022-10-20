/*
 * Utilities around resource roles and policies. This logic belongs in the data
 * layer and not in app/ because we are experimenting with it to decide whether
 * it belongs in the API proper.
 */
import { useMemo } from 'react'

import { lowestBy, sortBy } from '@oxide/util'

import { useApiQuery } from '.'
import type {
  FleetRole,
  IdentityType,
  OrganizationRole,
  ProjectRole,
  SiloRole,
} from './__generated__/Api'

/**
 * Union of all the specific roles, which are all the same, which makes making
 * our methods generic on the *Role type is pointless (until they stop being the same).
 * Only named `RoleName` because the API client already exports `Role`.
 */
export type RoleKey = FleetRole | SiloRole | OrganizationRole | ProjectRole

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
 *
 * @param roleName Pass `null` to delete the user from the policy.
 */
export function setUserRole(
  userId: string,
  roleName: RoleKey | null,
  policy: Policy
): Policy {
  // filter out any existing role assignments — we're pretending for now that you can only
  const roleAssignments = policy.roleAssignments.filter((ra) => ra.identityId !== userId)
  if (roleName !== null) {
    roleAssignments.push({
      identityId: userId,
      identityType: 'silo_user',
      roleName,
    })
  }
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

/**
 * Fetch list of users and filter out the ones that are already in the given
 * policy.
 */
export function useUsersNotInPolicy(
  // allow undefined because this is fetched with RQ
  policy: Policy | undefined
) {
  const { data: users } = useApiQuery('userList', {})
  // const { data: groups } = useApiQuery('groupList', {})
  return useMemo(() => {
    // IDs are UUIDs, so no need to include identity type in set value to disambiguate
    const usersInPolicy = new Set(policy?.roleAssignments.map((ra) => ra.identityId) || [])
    return (
      users?.items
        // only show users for adding if they're not already in the policy
        .filter((u) => !usersInPolicy.has(u.id)) || []
    )
  }, [users, policy])
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

// Not having pop-in when the requests resolve depends on the right prefetches
// having happened. This is probably too fragile. We need to explore this.
// https://tkdodo.eu/blog/react-query-meets-react-router#a-typescript-tip
export function useEffectiveSiloRole() {
  const { data: me } = useApiQuery('sessionMe', {})
  const { data: myGroups } = useApiQuery('sessionMeGroups', {})
  const { data: siloPolicy } = useApiQuery('policyView', {})
  return me && myGroups && siloPolicy
    ? userRoleFromPolicies(me, myGroups.items, [siloPolicy])
    : null
}

const readRoles = new Set<RoleKey>(['admin', 'collaborator', 'viewer'])
const writeRoles = new Set<RoleKey>(['admin', 'collaborator'])

export const canRead = (role: RoleKey | null) => (role ? readRoles.has(role) : false)
export const canWrite = (role: RoleKey | null) => (role ? writeRoles.has(role) : false)
