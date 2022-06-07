import type { Project, ProjectResultsPage, ProjectRolesPolicy } from '@oxide/api'
import type { Json } from './json-type'
import { org } from './org'
import { user } from './user'

export const project: Json<Project> = {
  id: 'mock-project-uuid',
  name: 'mock-project',
  description: 'a fake project',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
  organization_id: org.id,
}

export const projects: Json<ProjectResultsPage> = { items: [project] }

export const projectRolePolicy: Json<ProjectRolesPolicy> = {
  role_assignments: [
    {
      identity_id: user.id,
      identity_type: 'silo_user',
      role_name: 'admin',
    },
  ],
}
