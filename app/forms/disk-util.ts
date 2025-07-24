/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type Image, type Snapshot } from '~/api'
import { diskSizeNearest10 } from '~/util/math'
import { GiB } from '~/util/units'

/**
 * Adjusts disk size field if current value is smaller than source size.
 * Used when selecting images or snapshots to ensure disk is large enough.
 */
export function adjustDiskSizeForSource(
  diskSizeField: { value: number; onChange: (value: number) => void },
  id: string | null | undefined,
  items: (Image | Snapshot)[]
) {
  if (!id) return

  const item = items.find((i) => i.id === id)
  if (!item) return

  const sourceSizeGiB = item.size / GiB
  if (diskSizeField.value < sourceSizeGiB) {
    diskSizeField.onChange(diskSizeNearest10(sourceSizeGiB))
  }
}
