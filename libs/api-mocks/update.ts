import semverRCompare from 'semver/functions/rcompare'

import type {
  ComponentUpdate,
  SystemUpdate,
  UpdateDeployment,
  UpdateableComponent,
} from '@oxide/gen/Api'

import type { Json } from './json-type'

const timestamps = {
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const systemUpdate1: Json<SystemUpdate> = {
  id: '14321d42-e4d7-4796-97d4-fabad5ab352d',
  version: '1.0.0',
  ...timestamps,
}

export const systemUpdate2: Json<SystemUpdate> = {
  id: 'dd802504-1b50-4720-ae60-1369b90fd5ea',
  version: '2.0.0',
  ...timestamps,
}

export function sortBySemverDesc<T extends { version: string }>(updates: T[]): T[] {
  const copy = [...updates] // don't sort the original, that would be confusing
  return copy.sort((a, b) => semverRCompare(a.version, b.version))
}

export const systemUpdates: Json<SystemUpdate[]> = sortBySemverDesc([
  systemUpdate1,
  systemUpdate2,
])

// WIP: a more natural way of expressing the mock tree. needs API changes to
// let me represent the PSC as the parent of the PSC RoT and PSC SP, and possibly
// even the PSC RoT as a separate node pointing to the bootloader image. Some
// container components have multiple images, like the Gimlet host.

// Define it as a tree and flatten it out because otherwise this is a nightmare

// type Item = { id: string; parentId?: string }
// type Node<T> = T & { children: Node<T>[] }

// function treeToList<T extends Item>(tree: Node<T>[]): T[] {
//   function flatten(node: Node<T>): T[] {
//     const { children, ...parent } = node
//     return [
//       // @ts-ignore
//       parent,
//       ...children.map((c) => ({ ...c, parentId: parent.id })).flatMap(flatten),
//     ]
//   }

//   return tree.flatMap(flatten)
// }

// type CU = Omit<Json<ComponentUpdate>, 'time_created' | 'time_modified' | 'version'>

/* 
  Example from RFD 334

Rack─┬─PSC─┬─RoT──Hubris Archive ABCD
     │     └─SP───Hubris Archive DCBA
     ├─Sidecar─┬─RoT──Hubris Archive ABCD
     │         └─SP───Hubris Archive FACE
     ├─Sidecar─┬─RoT──Hubris Archive ABCD
     │         └─SP───Hubris Archive FACE
     ├─Scrimlet─┬─RoT──Hubris Archive ABCD
     │          ├─SP───Hubris Archive BEEF
     │          └─Host─┬─Host Phase 1 Image 1234
     │                 ├─Host Phase 2 Image 1234
     │                 └─Omicron Image 5678
     ├─Scrimlet …
     ├─Gimlet …
     └─Gimlet─┬─RoT──Hubris Archive ABCD
              ├─SP───Hubris Archive BEEF
              └─Host─┬─Host Phase 1 Image 1234
                     ├─Host Phase 2 Image 1234
                     └─Omicron Image 5678
*/

// const tree: Node<CU>[] = [
//   {
//     id: 'a',
//     component_type: 'bootloader_for_rot',
//     children: [
//       {
//         id: 'b',
//         component_type: 'bootloader_for_rot',
//         children: [],
//       },
//       {
//         id: 'c',
//         component_type: 'bootloader_for_rot',
//         children: [],
//       },
//     ],
//   },
// ]

// export const componentUpdates: Json<ComponentUpdate[]> = treeToList(tree).map((n, i) => ({
//   ...n,
//   version: `${i + 1}.0.0`,
//   ...timestamps,
// }))

// console.dir(componentUpdates)

export const componentUpdates: Json<ComponentUpdate[]> = (
  [
    {
      id: 'df9f1550-ce9d-4d9b-abc7-a75706a4a7c8',
      component_type: 'bootloader_for_rot',
      version: '1.0.0',
    },
    {
      id: 'd656468a-b891-4902-bfbe-43ff9cb1b1fb',
      component_type: 'bootloader_for_host_proc',
      version: '2.0.0',
    },
    {
      id: '95e724e3-2f7f-4d44-9a4e-defac158361b',
      component_type: 'bootloader_for_sp',
      version: '3.0.0',
    },
    {
      id: '4008ead5-1b19-48ba-abe2-be006e280252',
      component_type: 'helios_host_phase1',
      version: '4.0.0',
    },
    {
      id: '157eae35-ce79-4c31-8ce8-c3479103b280',
      component_type: 'helios_host_phase2',
      version: '5.0.0',
    },
    {
      id: '763768a0-2b4d-4abd-852a-53df1c35b293',
      component_type: 'host_omicron',
      version: '6.0.0',
    },
    {
      id: '8e055fe5-ec97-46ca-be78-45e8ef543094',
      component_type: 'hubris_for_gimlet_rot',
      version: '7.0.0',
    },
  ] as const
).map((o) => ({ ...o, ...timestamps }))

type SystemUpdateComponentUpdate = {
  system_update_id: string
  component_update_id: string
}

export const systemUpdateComponentUpdates: SystemUpdateComponentUpdate[] =
  componentUpdates.map(({ id }) => ({
    system_update_id: systemUpdate1.id,
    component_update_id: id,
  }))

export const updateableComponents: Json<UpdateableComponent[]> = [
  {
    id: '275cfce8-3897-4778-946f-53cde00c7d65',
    version: '1.0.0',
    system_version: systemUpdate1.version,
    component_type: 'helios_host_phase1',
    device_id: 'abc',
    status: { status: 'steady' },
    ...timestamps,
  },
  {
    id: '39e86b41-9f12-4e16-b59a-aed742a03814',
    version: '0.2.0',
    system_version: systemUpdate2.version,
    component_type: 'hubris_for_psc_rot',
    device_id: 'abc',
    status: { status: 'steady' },
    ...timestamps,
  },
]

export const updateDeployments: Json<UpdateDeployment[]> = [
  {
    id: 'f3d4dc98-8f75-4b93-95c7-264163074661',
    version: '1.0.0',
    status: { status: 'steady' },
    ...timestamps,
  },
]
