import type { Image } from '@oxide/api'

import type { Json } from './json-type'
import { project } from './project'

const base = {
  project_id: project.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  block_size: 4096,
  os: 'alpine',
  version: 'edge',
}

export const images: Json<Image>[] = [
  {
    id: '7ea31aad-7004-4d1e-ada6-a2e447da40b7',
    name: 'image-1',
    description: "it's an image",
    size: 1024,
    ...base,
  },

  {
    id: '9bbba93d-aac3-4c00-ad04-2e05a555a59a',
    name: 'image-2',
    description: "it's a second image",
    size: 2048,
    ...base,
  },
  {
    id: '4700ecf1-8f48-4ecf-b78e-816ddb76aaca',
    name: 'image-3',
    description: "it's a third image",
    size: 3072,
    ...base,
  },
  {
    id: 'd150b87d-eb20-49d2-8b56-ff5564670e8c',
    name: 'image-4',
    description: "it's a fourth image",
    size: 4096,
    ...base,
  },
]
