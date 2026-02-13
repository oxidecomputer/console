/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { InstanceCpuPlatform } from '~/api'
import type { ListboxItem } from '~/ui/lib/Listbox'

export type FormCpuPlatform = InstanceCpuPlatform | 'none'

export const cpuPlatformItems: ListboxItem<FormCpuPlatform>[] = [
  { value: 'none', label: 'No requirement' },
  { value: 'amd_milan', label: 'AMD Milan' },
  { value: 'amd_turin', label: 'AMD Turin' },
]
