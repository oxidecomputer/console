/*
 * Utilities around resource roles and policies. This logic belongs in the data
 * layer and not in app/ because we are experimenting with it to decide whether
 * it belongs in the API proper.
 */
import { sortBy } from '@oxide/util'

import type { OrganizationRole, ProjectRole } from './__generated__/Api'

// generic policy
type RoleAssignment<Role> = { identityId: string; roleName: Role }
type Policy<Role> = { roleAssignments: RoleAssignment<Role>[] }

export const getMainRole =
  <Role extends string>(roleOrder: Record<Role, number>) =>
  (userId: string, policy: Policy<Role>): Role | null => {
    const userRoles = policy.roleAssignments
      .filter((ra) => ra.identityId === userId)
      .map((ra) => ra.roleName)

    if (userRoles.length === 0) return null

    return sortBy(userRoles, (r) => roleOrder[r])[0]
  }

// right now these are both identical, so this feels a bit silly

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
export const orgRoleOrder: Record<OrganizationRole, number> = {
  admin: 0,
  collaborator: 1,
  viewer: 2,
}

/** Given a user ID and a policy, get the most permissive role for that user */
export const getOrgRole = getMainRole(orgRoleOrder)
