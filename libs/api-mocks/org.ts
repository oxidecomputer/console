import type { Organization, OrganizationResultsPage } from '@oxide/api'

export const org: Organization = {
  id: 'org-uuid',
  name: 'maze-war',
  description: 'a fake org',
  timeCreated: new Date(2021, 0, 1),
  timeModified: new Date(2021, 0, 2),
}

export const orgs: OrganizationResultsPage = { items: [org] }
