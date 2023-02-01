import type { Sled } from '@oxide/api'

import type { Json } from './json-type'

export const sled: Json<Sled> = {
  id: 'c2519937-44a4-493b-9b38-5c337c597d08',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
  service_address: '2001:db8:100:a:0:bc:abcd:d0e',
  rack_id: '6fbafcc7-1626-4785-be65-e212f8ad66d0',
  baseboard: {
    part: '913-0000008',
    serial: 'BRM02222867',
    revision: 0,
  },
}

export const sleds: Json<Sled[]> = [sled]
