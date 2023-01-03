import type { SystemUpdate } from '@oxide/gen/Api'

import type { Json } from './json-type'

export const systemUpdate1: Json<SystemUpdate> = {
  id: 'dd802504-1b50-4720-ae60-1369b90fd5ea',
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  version: '1.0.0',
}

export const systemUpdates: Json<SystemUpdate[]> = [systemUpdate1]
