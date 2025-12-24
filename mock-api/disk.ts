/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Disk, DiskState } from '@oxide/api'

import { GiB } from '~/util/units'

import { instance } from './instance'
import type { Json } from './json-type'
import { Rando } from './msw/rando'
import { project, project2 } from './project'

// Use seeded random for consistent states across runs
const rando = new Rando(0)

const randomDiskState = (): DiskState => {
  const states: DiskState['state'][] = [
    'attached',
    'attaching',
    'creating',
    'detaching',
    'detached',
    'destroyed',
    'faulted',
    'maintenance',
    'import_ready',
    'importing_from_url',
    'importing_from_bulk_writes',
    'finalizing',
  ]

  const state = states[Math.floor(rando.next() * states.length)]

  switch (state) {
    case 'attached':
    case 'attaching':
    case 'detaching':
      return { state, instance: '32a0249f-3a5c-4d30-a154-2476e372aa62' }
    case 'detached':
    case 'creating':
    case 'destroyed':
    case 'faulted':
    case 'maintenance':
    case 'import_ready':
    case 'importing_from_url':
    case 'importing_from_bulk_writes':
    case 'finalizing':
      return { state }
  }
}

export const disk1: Json<Disk> = {
  id: '7f2309a5-13e3-47e0-8a4c-2a3b3bc992fd',
  name: 'disk-1',
  description: "it's a disk",
  project_id: project.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  state: { state: 'attached', instance: instance.id },
  size: 2 * GiB,
  block_size: 2048,
  disk_type: { type: 'distributed' },
}

export const disk2: Json<Disk> = {
  id: '48f94570-60d8-401c-857f-5bf912d2d3fc',
  name: 'disk-2',
  description: "it's a second disk",
  project_id: project.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  state: { state: 'attached', instance: instance.id },
  size: 4 * GiB,
  block_size: 2048,
  disk_type: { type: 'distributed' },
}

export const disks: Json<Disk>[] = [
  disk1,
  disk2,
  {
    id: '3b768903-1d0b-4d78-9308-c12d3889bdfb',
    name: 'disk-3',
    description: "it's a third disk",
    project_id: project.id,
    // random hard-coded date with many digits to exercise date parsing
    time_created: '2025-02-13T01:02:03.134789034233Z',
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    size: 6 * GiB,
    block_size: 2048,
    disk_type: { type: 'distributed' },
  },
  {
    id: '5695b16d-e1d6-44b0-a75c-7b4299831540',
    name: 'disk-4',
    description: "it's a fourth disk",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    size: 64 * GiB,
    block_size: 2048,
    disk_type: { type: 'distributed' },
  },
  {
    id: '4d6f4c76-675f-4cda-b609-f3b8b301addb',
    name: 'disk-5',
    description:
      "It is an ancient Mariner, And he stoppeth one of three. 'By thy long grey beard and glittering eye, Now wherefore stopp'st thou me? The Bridegroom's doors are opened wide, And I am next of kin; The guests are met, the feast is set: May'st hear the merry din.'",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    size: 128 * GiB,
    block_size: 2048,
    disk_type: { type: 'distributed' },
  },
  {
    id: '41481936-5a6b-4dcd-8dec-26c3bdc343bd',
    name: 'disk-6',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    size: 20 * GiB,
    block_size: 2048,
    disk_type: { type: 'distributed' },
  },
  {
    id: '704cd392-9f6b-4a2b-8410-1f1e0794db80',
    name: 'disk-7',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    size: 24 * GiB,
    block_size: 2048,
    disk_type: { type: 'distributed' },
  },
  {
    id: '305ee9c7-1930-4a8f-86d7-ed9eece9598e',
    name: 'disk-8',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    size: 16 * GiB,
    block_size: 2048,
    disk_type: { type: 'distributed' },
  },
  {
    id: 'ccad8d48-df21-4a80-8c16-683ee6bfb290',
    name: 'disk-9',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    size: 32 * GiB,
    block_size: 2048,
    disk_type: { type: 'distributed' },
  },
  {
    id: 'a028160f-603c-4562-bb71-d2d76f1ac2a8',
    name: 'disk-10',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    size: 24 * GiB,
    block_size: 2048,
    disk_type: { type: 'distributed' },
  },
  {
    id: '3f23c80f-c523-4d86-8292-2ca3f807bb12',
    name: 'disk-snapshot-error',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    size: 12 * GiB,
    block_size: 2048,
    disk_type: { type: 'distributed' },
  },
  // put a ton of disks in project 2 so we can use it to test comboboxes
  ...Array.from({ length: 1010 }).map((_, i) => {
    const numStr = (i + 1).toString().padStart(4, '0')
    return {
      id: '9747d936-795d-4d76-8ee0-15561f4cbb' + numStr,
      name: 'disk-' + numStr,
      description: '',
      project_id: project2.id,
      time_created: new Date().toISOString(),
      time_modified: new Date().toISOString(),
      state: randomDiskState(),
      size: 12 * GiB,
      block_size: 2048,
      disk_type: { type: 'distributed' } as const,
    }
  }),
]
