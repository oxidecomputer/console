import type { ProjectJSON, ProjectResultsPageJSON } from '@oxide/api'
import { org } from './org'

export const project: ProjectJSON = {
  id: 'mock-project-uuid',
  name: 'mock-project',
  description: 'a fake project',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
  organization_id: org.id,
}

export const projects: ProjectResultsPageJSON = { items: [project] }
