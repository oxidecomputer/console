/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { FLEET_ID, type IdentityType, type RoleKey } from '@oxide/api'

import { project, projectAdorno, projectAnscombe, projectKosman } from './project'
import { defaultSilo, myriadSilo, pelerinesSilo, thraxSilo } from './silo'
import { user1, user3, user5, user6, userAdorno, userAnscombe, userKosman } from './user'
import { userGroup2, userGroup3 } from './user-group'

// For most other resources, we can store the API types directly in the DB. But
// in this case the API response doesn't have the resource ID on it, and we need
// that to fetch the roles for, e.g., a given project. So here we are instead
// imitating the API's actual DB schema and behavior, storing individual role
// assignments and then collecting them into a policy object at request time.
// See https://github.com/oxidecomputer/omicron/issues/1165

export type DbRoleAssignmentResourceType = 'fleet' | 'silo' | 'project'

type DbRoleAssignment = {
  resource_type: DbRoleAssignmentResourceType
  resource_id: string
  identity_id: string
  identity_type: IdentityType
  role_name: RoleKey
}

export const roleAssignments: DbRoleAssignment[] = [
  {
    resource_type: 'fleet',
    resource_id: FLEET_ID,
    identity_id: user1.id, // Hannah Arendt
    identity_type: 'silo_user',
    role_name: 'admin',
  },
  {
    resource_type: 'fleet',
    resource_id: FLEET_ID,
    identity_id: user5.id, // Jane Austen
    identity_type: 'silo_user',
    role_name: 'viewer',
  },
  {
    resource_type: 'silo',
    resource_id: defaultSilo.id,
    identity_id: userGroup3.id, // real-estate-devs
    identity_type: 'silo_group',
    role_name: 'collaborator',
  },
  {
    resource_type: 'silo',
    resource_id: defaultSilo.id,
    identity_id: user1.id, // Hannah Arendt
    identity_type: 'silo_user',
    role_name: 'admin',
  },
  {
    resource_type: 'project',
    resource_id: project.id,
    identity_id: user3.id, // Jacob Klein
    identity_type: 'silo_user',
    role_name: 'collaborator',
  },
  {
    resource_type: 'project',
    resource_id: project.id,
    identity_id: userGroup2.id, // kernel-devs
    identity_type: 'silo_group',
    role_name: 'viewer',
  },
  {
    resource_type: 'project',
    resource_id: project.id,
    identity_id: user6.id, // Herbert Marcuse
    identity_type: 'silo_user',
    role_name: 'limited_collaborator',
  },
  // Role assignments for test silos (IP pool configuration testing)
  // myriad silo: v4-only default pool
  {
    resource_type: 'silo',
    resource_id: myriadSilo.id,
    identity_id: userKosman.id,
    identity_type: 'silo_user',
    role_name: 'admin',
  },
  {
    resource_type: 'project',
    resource_id: projectKosman.id,
    identity_id: userKosman.id,
    identity_type: 'silo_user',
    role_name: 'admin',
  },
  // thrax silo: v6-only default pool
  {
    resource_type: 'silo',
    resource_id: thraxSilo.id,
    identity_id: userAnscombe.id,
    identity_type: 'silo_user',
    role_name: 'admin',
  },
  {
    resource_type: 'project',
    resource_id: projectAnscombe.id,
    identity_id: userAnscombe.id,
    identity_type: 'silo_user',
    role_name: 'admin',
  },
  // pelerines silo: no default pools
  {
    resource_type: 'silo',
    resource_id: pelerinesSilo.id,
    identity_id: userAdorno.id,
    identity_type: 'silo_user',
    role_name: 'admin',
  },
  {
    resource_type: 'project',
    resource_id: projectAdorno.id,
    identity_id: userAdorno.id,
    identity_type: 'silo_user',
    role_name: 'admin',
  },
]
