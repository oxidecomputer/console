import type { Project, ProjectResultsPage } from '@oxide/api'
import { org } from './org'

export const project: Project = {
  id: 'mock-project-uuid',
  name: 'mock-project',
  description: 'a fake project',
  timeCreated: new Date(2021, 0, 1),
  timeModified: new Date(2021, 0, 2),
  organizationId: org.id,
}

export const projects: ProjectResultsPage = { items: [project] }
