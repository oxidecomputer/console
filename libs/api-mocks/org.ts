import type { OrganizationJSON, OrganizationResultsPageJSON } from '@oxide/api'

export const org: OrganizationJSON = {
  id: 'org-uuid',
  name: 'maze-war',
  description: 'a fake org',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
}

export const orgs: OrganizationResultsPageJSON = { items: [org] }
