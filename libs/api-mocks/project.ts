import type { Project, ProjectRolePolicy } from '@oxide/api'

import type { Json } from './json-type'
import { genId } from './msw/util'
import { org } from './org'
import { user1 } from './user'

export const project: Json<Project> = {
  id: <uuid>,
  name: 'mock-project',
  description: 'a fake project',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
  organization_id: org.id,
}

export const project2: Json<Project> = {
  id: <uuid>,
  name: 'other-project',
  description: 'another fake project',
  time_created: new Date(2021, 0, 15).toISOString(),
  time_modified: new Date(2021, 0, 16).toISOString(),
  organization_id: org.id,
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
