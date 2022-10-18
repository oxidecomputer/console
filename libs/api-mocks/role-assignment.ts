import type { IdentityType } from 'libs/api/__generated__/Api'
import type { RoleKey } from 'libs/api/roles'

import { org } from './org'
import { project } from './project'
import { defaultSilo } from './silo'
import { user1, user2, user3 } from './user'
import { userGroup1, userGroup2, userGroup3 } from './user-group'

// For most other resources, we can store the API types directly in the DB. But
// in this case the API response doesn't have the resource ID on it, and we need
// that to fetch the roles for, e.g., a given project. So here we are instead
// imitating the API's actual DB schema and behavior, storing individual role
// assignments and then collecting them into a policy object at request time.
// See https://github.com/oxidecomputer/omicron/issues/1165
type DbRoleAssignment = {
  resource_type: 'fleet' | 'silo' | 'organization' | 'project'
  resource_id: string
  identity_id: string
  identity_type: IdentityType
  role_name: RoleKey
}

// this is hard-coded in the API. there can only be one
export const FLEET_ID = '001de000-1334-4000-8000-000000000000'

export const roleAssignments: DbRoleAssignment[] = [
  {
    resource_type: 'fleet',
    resource_id: FLEET_ID,
    identity_id: user1.id,
    identity_type: 'silo_user',
    role_name: 'admin',
  },
  {
    resource_type: 'silo',
    resource_id: defaultSilo.id,
    identity_id: userGroup3.id,
    identity_type: 'silo_group',
    role_name: 'admin',
  },
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
    resource_type: 'organization',
    resource_id: org.id,
    identity_id: userGroup1.id,
    identity_type: 'silo_group',
    role_name: 'collaborator',
  },
  {
    resource_type: 'project',
    resource_id: project.id,
    identity_id: user3.id,
    identity_type: 'silo_user',
    role_name: 'collaborator',
  },
  {
    resource_type: 'project',
    resource_id: project.id,
    identity_id: userGroup2.id,
    identity_type: 'silo_group',
    role_name: 'viewer',
  },
]
