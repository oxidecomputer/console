import type {
  OrganizationRoleRoleAssignment,
  ProjectRoleRoleAssignment,
  SiloRoleRoleAssignment,
} from 'libs/api/__generated__/Api'

import type { Json } from './json-type'
import { org } from './org'
import { project } from './project'
import { defaultSilo } from './silo'
import { user1, user2, user3 } from './user'

// For most other resources, we can store the API types directly in the DB. But
// in this case the API response doesn't have the resource ID on it, and we need
// that to fetch the roles for, e.g., a given project. So here we are instead
// imitating the API's actual DB schema and behavior, storing individual role
// assignments and then collecting them into a policy object at request time.
// See https://github.com/oxidecomputer/omicron/issues/1165
type DbRoleAssignment = { resource_id: string } & (
  | ({ resource_type: 'project' } & Json<ProjectRoleRoleAssignment>)
  | ({ resource_type: 'organization' } & Json<OrganizationRoleRoleAssignment>)
  | ({ resource_type: 'silo' } & Json<SiloRoleRoleAssignment>)
)

export const roleAssignments: DbRoleAssignment[] = [
  {
    resource_type: 'silo',
    resource_id: defaultSilo.id,
    identity_id: user1.id,
    identity_type: 'silo_user',
    role_name: 'admin',
  },
  {
    resource_type: 'organization',
    resource_id: org.id,
    identity_id: user2.id,
    identity_type: 'silo_user',
    role_name: 'viewer',
  },
  {
    resource_type: 'project',
    resource_id: project.id,
    identity_id: user3.id,
    identity_type: 'silo_user',
    role_name: 'collaborator',
  },
]
