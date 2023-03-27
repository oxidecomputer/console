import type { GlobalImage } from '@oxide/api'
import { GiB } from '@oxide/util'

import type { Json } from './json-type'

export const globalImages: Json<GlobalImage>[] = [
  {
    id: 'ae46ddf5-a8d5-40fa-bcda-fcac606e3f9b',
    name: 'ubuntu-22-04',
    description: 'Latest Ubuntu LTS',
    distribution: 'ubuntu',
    version: '22.04',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 1 * GiB,
    block_size: 4096,
  },
  {
    id: 'a2ea1d7a-cc5a-4fda-a400-e2d2b18f53c5',
    name: 'ubuntu-20-04',
    description: 'Previous LTS',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    distribution: 'ubuntu',
    version: '20.04',
    size: 2 * GiB,
    block_size: 4096,
  },
  {
    id: 'bd6aa051-8075-421d-a641-fae54a0ce8ef',
    name: 'arch-2022-06-01',
    description: 'Latest Arch Linux',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    distribution: 'arch',
    version: '2022.06.01',
    size: 3 * GiB,
    block_size: 4096,
  },
]
