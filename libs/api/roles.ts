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
  User,
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

/**
 * Fetch list of users and filter out the ones that are already in the given
 * policy.
 */
export function useUsersNotInPolicy(
  // allow undefined because this is fetched with RQ
  policy: Policy | undefined
) {
  const { data: users } = useApiQuery('userList', {})
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

// temporary until we figure out how we're getting groups from the API
export type SessionMe = User & {
  groupIds?: string[]
}

export function userRoleFromPolicies(user: SessionMe, policies: Policy[]): RoleKey | null {
  const myIds = new Set([user.id, ...(user.groupIds || [])])
  const myRoles = policies
    .flatMap((p) => p.roleAssignments) // concat all the role assignments together
    .filter((ra) => myIds.has(ra.identityId))
    .map((ra) => ra.roleName)
  return getEffectiveRole(myRoles) || null
}
