/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Sled } from '@oxide/api'

import type { Json } from './json-type'

export const sleds: Json<Sled[]> = [
  {
    id: 'c2519937-44a4-493b-9b38-5c337c597d08',
    time_created: new Date(2023, 0, 1).toISOString(),
    time_modified: new Date(2023, 0, 2).toISOString(),
    rack_id: '6fbafcc7-1626-4785-be65-e212f8ad66d0',
    policy: {
      kind: 'in_service',
      provision_policy: 'provisionable',
    },
    state: 'active',
    baseboard: {
      part: '913-0000108',
      serial: 'BRM02222869',
      revision: 0,
    },
    usable_hardware_threads: 128,
    usable_physical_ram: 1_099_511_627_776,
  },
  {
    id: '1ec7df9d-a6de-423c-8bf8-01557e8e5aea',
    time_created: new Date(2024, 0, 1).toISOString(),
    time_modified: new Date(2024, 0, 2).toISOString(),
    rack_id: '759a1c80-4bff-4d0b-97ce-b482ca936724',
    policy: {
      kind: 'in_service',
      provision_policy: 'non_provisionable',
    },
    state: 'active',
    baseboard: {
      part: '913-0001008',
      serial: 'BRM02222870',
      revision: 0,
    },
    usable_hardware_threads: 128,
    usable_physical_ram: 1_099_511_627_776,
  },
  {
    id: 'fca81647-868a-4aa5-b8c3-84364d4b4dc9',
    time_created: new Date(2022, 0, 1).toISOString(),
    time_modified: new Date(2022, 0, 2).toISOString(),
    rack_id: 'ebe9a4c0-248b-491c-9448-04ddb10ef648',
    policy: {
      kind: 'expunged',
    },
    state: 'active',
    baseboard: {
      part: '913-0000018',
      serial: 'BRM02222868',
      revision: 0,
    },
    usable_hardware_threads: 128,
    usable_physical_ram: 1_099_511_627_776,
  },
  {
    id: 'a4ed0c62-cb3a-48bc-a7a8-ee544a8a8869',
    time_created: new Date(2021, 0, 1).toISOString(),
    time_modified: new Date(2021, 0, 2).toISOString(),
    rack_id: '64f712fe-4320-407d-835a-d63b0455d89c',
    policy: {
      kind: 'expunged',
    },
    state: 'decommissioned',
    baseboard: {
      part: '913-0000008',
      serial: 'BRM02222867',
      revision: 0,
    },
    usable_hardware_threads: 128,
    usable_physical_ram: 1_099_511_627_776,
  },
]
