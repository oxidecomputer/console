import type { Organization } from '@oxide/api'

import type { Json } from './json-type'

export const org: Json<Organization> = {
  id: '0fc0716f-1bc9-451a-92f3-a7dd63589298',
  name: 'maze-war',
  description: 'a fake org',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
}

export const org2: Json<Organization> = {
  id: '915efcd1-3ac4-447a-a3a3-65b74d413920',
  name: 'boop-team',
  description: 'another fake org',
  time_created: new Date(2021, 0, 3).toISOString(),
  time_modified: new Date(2021, 0, 4).toISOString(),
}

export const orgs: Json<Organization[]> = [org, org2]
