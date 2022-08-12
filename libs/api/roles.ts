/*
 * Utilities around resource roles and policies. This logic belongs in the data
 * layer and not in app/ because we are experimenting with it to decide whether
 * it belongs in the API proper.
 */
import { useMemo } from 'react'

import { sortBy } from '@oxide/util'

import { useApiQuery } from '.'
import type { IdentityType, OrganizationRole, ProjectRole } from './__generated__/Api'

/** Given a role order and a list of roles, get the one that sorts earliest */
export const getMainRole =
  <Role extends string>(roleOrder: Record<Role, number>) =>
  (userRoles: Role[]): Role | null =>
    userRoles.length > 0 ? sortBy(userRoles, (r) => roleOrder[r])[0] : null

/** Turn a role order record into a sorted array of strings. */
const flatRoles = <Role extends string>(roleOrder: Record<Role, number>): Role[] =>
  sortBy(Object.entries(roleOrder), ([_role, order]) => order).map(([role]) => role as Role)

////////////////////////////
// Project roles
////////////////////////////

/** Project roles from most to least permissive */
export const projectRoleOrder: Record<ProjectRole, number> = {
  admin: 0,
  collaborator: 1,
  viewer: 2,
}

/** Given a user ID and a policy, get the most permissive role for that user */
export const getProjectRole = getMainRole(projectRoleOrder)

/** `projectRoleOrder` record converted to a sorted array of roles. */
export const projectRoles = flatRoles(projectRoleOrder)

////////////////////////////
// Org roles
////////////////////////////

// right now orgs and projects are identical, so the below feels a bit silly
// using Record for the orders ensures the ordering includes all roles

/** Org roles from most to least permissive */
export const orgRoleOrder: Record<OrganizationRole, number> = {
  admin: 0,
  collaborator: 1,
  viewer: 2,
}

/** `orgRoleOrder` record converted to a sorted array of roles. */
export const orgRoles = flatRoles(orgRoleOrder)

/** Given a user ID and a policy, get the most permissive role for that user */
export const getOrgRole = getMainRole(orgRoleOrder)

////////////////////////////
// Policy helpers
////////////////////////////

// generic policy, used to represent org and project policies while agnostic
// about the roles enum
type RoleAssignment<Role> = {
  identityId: string
  identityType: IdentityType
  roleName: Role
}
type Policy<Role extends string> = { roleAssignments: RoleAssignment<Role>[] }

/**
 * Returns a new updated policy. Does not modify the passed-in policy.
 *
 * @param roleName Pass `null` to delete the user from the policy.
 */
export function setUserRole<Role extends string>(
  userId: string,
  roleName: Role | null,
  policy: Policy<Role>
): Policy<Role> {
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

type UserAccessRow<Role extends string> = {
  id: string
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
export function useUserRows<Role extends string>(
  roleAssignments: RoleAssignment<Role>[] | undefined,
  roleSource: string
): UserAccessRow<Role>[] {
  // HACK: because the policy has no names, we are fetching ~all the users,
  // putting them in a dictionary, and adding the names to the rows
  const usersDict = useUsersDict()
  return useMemo(
    () =>
      (roleAssignments || []).map((ra) => ({
        id: ra.identityId,
        name: usersDict[ra.identityId]?.displayName || '', // placeholder until we get names, obviously
        roleName: ra.roleName,
        roleSource,
      })),
    [roleAssignments, roleSource, usersDict]
  )
}

function useUsersDict() {
  const { data: users } = useApiQuery('userList', { limit: 200 })
  return useMemo(
    () => Object.fromEntries((users?.items || []).map((u) => [u.id, u])),
    [users]
  )
}

/**
 * Fetch list of users and filter out the ones that are already in the given
 * policy.
 */
export function useUsersNotInPolicy<Role extends string>(
  // allow undefined because this is fetched with RQ
  policy: Policy<Role> | undefined
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
