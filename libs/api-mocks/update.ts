import type { ComponentUpdate, SystemUpdate } from '@oxide/gen/Api'

import type { Json } from './json-type'

const timestamps = {
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const systemUpdate1: Json<SystemUpdate> = {
  id: 'dd802504-1b50-4720-ae60-1369b90fd5ea',
  version: '1.0.0',
  ...timestamps,
}

export const systemUpdates: Json<SystemUpdate[]> = [systemUpdate1]

export const componentUpdate1: Json<ComponentUpdate> = {
  id: 'df9f1550-ce9d-4d9b-abc7-a75706a4a7c8',
  device_type: 'disk',
  version: '1.0.0',
  ...timestamps,
}

export const componentUpdate2: Json<ComponentUpdate> = {
  id: 'd656468a-b891-4902-bfbe-43ff9cb1b1fb',
  device_type: 'disk',
  version: '2.0.0',
  parent_id: componentUpdate1.id,
  ...timestamps,
}

export const componentUpdate3: Json<ComponentUpdate> = {
  id: '95e724e3-2f7f-4d44-9a4e-defac158361b',
  device_type: 'disk',
  version: '3.0.0',
  parent_id: componentUpdate1.id,
  ...timestamps,
}

export const componentUpdates: Json<ComponentUpdate[]> = [
  componentUpdate1,
  componentUpdate2,
  componentUpdate3,
  {
    id: '4008ead5-1b19-48ba-abe2-be006e280252',
    device_type: 'disk',
    version: '4.0.0',
    parent_id: componentUpdate1.id,
    ...timestamps,
  },
  {
    id: '157eae35-ce79-4c31-8ce8-c3479103b280',
    device_type: 'disk',
    version: '5.0.0',
    parent_id: componentUpdate2.id,
    ...timestamps,
  },
  {
    id: '763768a0-2b4d-4abd-852a-53df1c35b293',
    device_type: 'disk',
    version: '6.0.0',
    parent_id: componentUpdate2.id,
    ...timestamps,
  },
  {
    id: '8e055fe5-ec97-46ca-be78-45e8ef543094',
    device_type: 'disk',
    version: '7.0.0',
    parent_id: componentUpdate3.id,
    ...timestamps,
  },
]

type SystemUpdateComponentUpdate = {
  system_update_id: string
  component_update_id: string
}

export const systemUpdateComponentUpdates: SystemUpdateComponentUpdate[] =
  componentUpdates.map(({ id }) => ({
    system_update_id: systemUpdate1.id,
    component_update_id: id,
  }))
