/*
 * Utilities around resource roles and policies. This logic belongs in the data
 * layer and not in app/ because we are experimenting with it to decide whether
 * it belongs in the API proper.
 */
import { sortBy } from '@oxide/util'

import type { IdentityType, OrganizationRole, ProjectRole } from './__generated__/Api'

/** Given a role order and a list of roles, get the one that sorts earliest */
export const getMainRole =
  <Role extends string>(roleOrder: Record<Role, number>) =>
  (userRoles: Role[]): Role | null =>
    userRoles.length > 0 ? sortBy(userRoles, (r) => roleOrder[r])[0] : null

// right now orgs and projects are identical, so this feels a bit silly

// using Record for the orders ensures the ordering includes all roles

/** Project roles from most to least permissive */
export const projectRoleOrder: Record<ProjectRole, number> = {
  admin: 0,
  collaborator: 1,
  viewer: 2,
}

/** Given a user ID and a policy, get the most permissive role for that user */
export const getProjectRole = getMainRole(projectRoleOrder)

/** Org roles from most to least permissive */
export const orgRoleOrder: Record<OrganizationRole, number> = projectRoleOrder

/** Given a user ID and a policy, get the most permissive role for that user */
export const getOrgRole = getMainRole(orgRoleOrder)

// generic policy, used to represent org and project policies while agnostic
// about the roles enum
type RoleAssignment<Role> = {
  identityId: string
  identityType: IdentityType
  roleName: Role
}
type Policy<Role extends string> = { roleAssignments: RoleAssignment<Role>[] }

/** Set user role. Pass `null` to delete the user. */
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
