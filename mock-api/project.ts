/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Project, ProjectRolePolicy } from '@oxide/api'

import type { Json } from './json-type'
import { user1 } from './user'

export const project: Json<Project> = {
  id: '5fbab865-3d09-4c16-a22f-ca9c312b0286',
  name: 'mock-project',
  description: 'a fake project',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
}

export const project2: Json<Project> = {
  id: 'e7bd835e-831e-4257-b600-f1db32844c8c',
  name: 'other-project',
  description: 'another fake project',
  time_created: new Date(2021, 0, 15).toISOString(),
  time_modified: new Date(2021, 0, 16).toISOString(),
}

export const projects: Json<Project[]> = [project, project2]

export const projectRolePolicy: Json<ProjectRolePolicy> = {
  role_assignments: [
    {
      identity_id: user1.id,
      identity_type: 'silo_user',
      role_name: 'admin',
    },
  ],
}
