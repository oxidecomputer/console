/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Project names must be globally unique across all silos in mock data. This
// simplifies lookup logic - we don't need to thread silo IDs through every
// lookup function. The projectList handler filters by silo, so users only
// see their own projects in the list. See /project.spec.ts for the uniqueness
// test.
//
// Ideally we *would* thread silo IDs through all the lookups (or do it sneakily
// by putting it in some kind of global state that all lookups can access), but
// we can figure that out later. This is ok for now because console navigation
// always goes through projects the user has access to — the only way to hit a
// cross-silo resource would be manually typing a URL.

import type { Project, ProjectRolePolicy } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo, myriadSilo, pelerinesSilo, thraxSilo } from './silo'
import { user1 } from './user'

// Internal mock type that tracks which silo owns each project
export type DbProject = Json<Project> & { silo_id: string }

export const project: DbProject = {
  id: '5fbab865-3d09-4c16-a22f-ca9c312b0286',
  name: 'mock-project',
  description: 'a fake project',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
  silo_id: defaultSilo.id,
}

export const project2: DbProject = {
  id: 'e7bd835e-831e-4257-b600-f1db32844c8c',
  name: 'other-project',
  description: 'another fake project',
  time_created: new Date(2021, 0, 15).toISOString(),
  time_modified: new Date(2021, 0, 16).toISOString(),
  silo_id: defaultSilo.id,
}

export const projectNoVpcs: DbProject = {
  id: 'f8a5c3d2-9b1e-4f7a-8c2d-3e4b5f6a7c8d',
  name: 'project-no-vpcs',
  description: 'a project with no VPCs for testing',
  time_created: new Date(2021, 0, 20).toISOString(),
  time_modified: new Date(2021, 0, 21).toISOString(),
  silo_id: defaultSilo.id,
}

// Projects for test silos (different IP pool configurations)
export const projectKosman: DbProject = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'kosman-project',
  description: 'project in myriad silo (v4-only default pool)',
  time_created: new Date(2024, 0, 5).toISOString(),
  time_modified: new Date(2024, 0, 6).toISOString(),
  silo_id: myriadSilo.id,
}

export const projectAnscombe: DbProject = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  name: 'anscombe-project',
  description: 'project in thrax silo (v6-only default pool)',
  time_created: new Date(2024, 0, 7).toISOString(),
  time_modified: new Date(2024, 0, 8).toISOString(),
  silo_id: thraxSilo.id,
}

export const projectAdorno: DbProject = {
  id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  name: 'adorno-project',
  description: 'project in pelerines silo (no default pools)',
  time_created: new Date(2024, 0, 9).toISOString(),
  time_modified: new Date(2024, 0, 10).toISOString(),
  silo_id: pelerinesSilo.id,
}

export const projects: DbProject[] = [
  project,
  project2,
  projectNoVpcs,
  projectKosman,
  projectAnscombe,
  projectAdorno,
]

export const projectRolePolicy: Json<ProjectRolePolicy> = {
  role_assignments: [
    {
      identity_id: user1.id,
      identity_type: 'silo_user',
      role_name: 'admin',
    },
  ],
}
