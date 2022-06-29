import type { GlobalImage } from '@oxide/api'

import type { Json } from './json-type'

export const globalImages: Json<GlobalImage>[] = [
  {
    id: 'ubuntu-1',
    name: 'ubuntu-22.04',
    description: 'Latest Ubuntu LTS',
    distribution: 'ubuntu',
    version: '22.04',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 1024,
    block_size: 4096,
  },
  {
    id: 'ubuntu-2',
    name: 'ubuntu-20.04',
    description: 'Previous LTS',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    distribution: 'ubuntu',
    version: '20.04',
    size: 2048,
    block_size: 4096,
  },
  {
    id: 'arch-1',
    name: 'arch-2022-06-01',
    description: 'Latest Arch Linux',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    distribution: 'arch',
    version: '2022.06.01',
    size: 3072,
    block_size: 4096,
  },
]
