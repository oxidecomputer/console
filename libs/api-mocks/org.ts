import type { Organization } from '@oxide/api'

import type { Json } from './json-type'

export const org: Json<Organization> = {
  id: 'org-uuid',
  name: 'maze-war',
  description: 'a fake org',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
}

export const org2: Json<Organization> = {
  id: 'org2-uuid',
  name: 'boop-team',
  description: 'another fake org',
  time_created: new Date(2021, 0, 3).toISOString(),
  time_modified: new Date(2021, 0, 4).toISOString(),
}

export const orgs: Json<Organization[]> = [org, org2]
