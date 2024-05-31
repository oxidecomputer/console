/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Disk } from '@oxide/api'

import { GiB } from '~/util/units'

import { instance } from './instance'
import type { Json } from './json-type'
import { project, project2 } from './project'

export const disks: Json<Disk>[] = [
  {
    id: '7f2309a5-13e3-47e0-8a4c-2a3b3bc992fd',
    name: 'disk-1',
    description: "it's a disk",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'attached', instance: instance.id },
    device_path: '/abc',
    size: 2 * GiB,
    block_size: 2048,
  },
  {
    id: '48f94570-60d8-401c-857f-5bf912d2d3fc',
    name: 'disk-2',
    description: "it's a second disk",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'attached', instance: instance.id },
    device_path: '/def',
    size: 4 * GiB,
    block_size: 2048,
  },
  {
    id: '3b768903-1d0b-4d78-9308-c12d3889bdfb',
    name: 'disk-3',
    description: "it's a third disk",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/ghi',
    size: 6 * GiB,
    block_size: 2048,
  },
  {
    id: '5695b16d-e1d6-44b0-a75c-7b4299831540',
    name: 'disk-4',
    description: "it's a fourth disk",
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/jkl',
    size: 64 * GiB,
    block_size: 2048,
  },
  {
    id: '4d6f4c76-675f-4cda-b609-f3b8b301addb',
    name: 'disk-5',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/jkl',
    size: 128 * GiB,
    block_size: 2048,
  },
  {
    id: '41481936-5a6b-4dcd-8dec-26c3bdc343bd',
    name: 'disk-6',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/jkl',
    size: 20 * GiB,
    block_size: 2048,
  },
  {
    id: '704cd392-9f6b-4a2b-8410-1f1e0794db80',
    name: 'disk-7',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/jkl',
    size: 24 * GiB,
    block_size: 2048,
  },
  {
    id: '305ee9c7-1930-4a8f-86d7-ed9eece9598e',
    name: 'disk-8',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/jkl',
    size: 16 * GiB,
    block_size: 2048,
  },
  {
    id: 'ccad8d48-df21-4a80-8c16-683ee6bfb290',
    name: 'disk-9',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/jkl',
    size: 32 * GiB,
    block_size: 2048,
  },
  {
    id: 'a028160f-603c-4562-bb71-d2d76f1ac2a8',
    name: 'disk-10',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/jkl',
    size: 24 * GiB,
    block_size: 2048,
  },
  {
    id: '3f23c80f-c523-4d86-8292-2ca3f807bb12',
    name: 'disk-snapshot-error',
    description: '',
    project_id: project.id,
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    state: { state: 'detached' },
    device_path: '/jkl',
    size: 12 * GiB,
    block_size: 2048,
  },
  // put a ton of disks in project 2 so we can use it to test pagination
  ...new Array(2222).fill(0).map((_, i) => {
    const numStr = (i + 1).toString().padStart(4, '0')
    return {
      id: '9747d936-795d-4d76-8ee0-15561f4cbb' + numStr,
      name: 'disk-' + numStr,
      description: '',
      project_id: project2.id,
      time_created: new Date().toISOString(),
      time_modified: new Date().toISOString(),
      state: { state: 'detached' as const },
      device_path: '/jkl',
      size: 12 * GiB,
      block_size: 2048,
    }
  }),
]
