import type { Image } from '@oxide/api'
import type { Json } from './json-type'
import { project } from './project'

export const images: Json<Image>[] = [
  {
    id: 'image-id-1',
    name: 'image-1',
    description: "it's an image",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 1000,
  },
  {
    id: 'image-id-2',
    name: 'image-2',
    description: "it's a second image",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 2000,
  },
  {
    id: 'image-id-3',
    name: 'image-3',
    description: "it's a third image",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 3000,
  },
  {
    id: 'image-id-4',
    name: 'image-4',
    description: "it's a fourth image",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    size: 4000,
  },
]
