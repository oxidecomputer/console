import type { Organization, OrganizationResultsPage } from '@oxide/api'

import type { Json } from './json-type'

export const org: Json<Organization> = {
  id: 'org-uuid',
  name: 'maze-war',
  description: 'a fake org',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
}

export const orgs: Json<OrganizationResultsPage> = { items: [org] }
