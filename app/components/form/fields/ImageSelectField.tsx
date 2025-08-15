/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback, useMemo } from 'react'
import { useController, type Control } from 'react-hook-form'

import type { Image } from '@oxide/api'

import type { InstanceCreateInput } from '~/forms/instance-create'
import type { ComboboxItem } from '~/ui/lib/Combobox'
import { Slash } from '~/ui/lib/Slash'
import { diskSizeNearest10 } from '~/util/math'
import { bytesToGiB, GiB } from '~/util/units'

import { ComboboxField } from './ComboboxField'

type ImageSelectFieldProps = {
  images: Image[]
  control: Control<InstanceCreateInput>
  disabled?: boolean
  name: 'siloImageSource' | 'projectImageSource'
}

export function BootDiskImageSelectField({
  images,
  control,
  disabled,
  name,
}: ImageSelectFieldProps) {
  const diskSizeField = useController({ control, name: 'bootDiskSize' }).field

  // Memoize the expensive toImageComboboxItem mapping to avoid recalculating on every render
  const imageComboboxItems = useMemo(
    () => images.map((i) => toImageComboboxItem(i)),
    [images]
  )

  // Memoize onChange callback to prevent function recreation on every render
  const handleChange = useCallback(
    (id: string) => {
      const image = images.find((i) => i.id === id)
      // the most likely scenario where image would be undefined is if the user has
      // manually cleared the ComboboxField; they will need to pick a boot disk image
      // in order to submit the form, so we don't need to do anything here
      if (!image) return
      const imageSizeGiB = image.size / GiB
      if (diskSizeField.value < imageSizeGiB) {
        diskSizeField.onChange(diskSizeNearest10(imageSizeGiB))
      }
    },
    [images, diskSizeField]
  )

  return (
    <ComboboxField
      disabled={disabled}
      control={control}
      name={name}
      label="Image"
      placeholder={
        name === 'siloImageSource' ? 'Select a silo image' : 'Select a project image'
      }
      items={imageComboboxItems}
      required
      onChange={(id) => handleChange(id || '')}
    />
  )
}

// Memoize expensive bytesToGiB calculations
const sizeCache = new Map<number, string>()

function getCachedSizeGiB(size: number): string {
  if (!sizeCache.has(size)) {
    sizeCache.set(size, `${bytesToGiB(size, 1)} GiB`)
  }
  return sizeCache.get(size)!
}

export function toImageComboboxItem(
  image: Image,
  includeProjectSiloIndicator = false
): ComboboxItem {
  const { id, name, os, projectId, size, version } = image

  const projectSiloIndicator = includeProjectSiloIndicator
    ? `${projectId ? 'Project' : 'Silo'} image`
    : null

  // Build metadata array more efficiently
  const metadata = []
  if (os) metadata.push(os)
  if (version) metadata.push(version)
  if (size) metadata.push(getCachedSizeGiB(size))
  if (projectSiloIndicator) metadata.push(projectSiloIndicator)

  const itemMetadata = metadata.map((item, index) => (
    <span key={item}>
      {index > 0 && <Slash />}
      {item}
    </span>
  ))

  return {
    value: id,
    selectedLabel: name,
    label: (
      <div className="flex flex-col gap-1">
        <div>{name}</div>
        <div className="text-secondary selected:text-accent-secondary">{itemMetadata}</div>
      </div>
    ),
  }
}
