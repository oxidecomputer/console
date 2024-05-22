/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useController, type Control } from 'react-hook-form'

import type { Image } from '@oxide/api'

import type { InstanceCreateInput } from '~/forms/instance-create'
import type { ListboxItem } from '~/ui/lib/Listbox'
import { ImageLabel, selectedImageLabel } from '~/ui/lib/ListboxLabels'
import { nearest10 } from '~/util/math'
import { GiB } from '~/util/units'

import { ListboxField } from './ListboxField'

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
  return (
    <ListboxField
      disabled={disabled}
      control={control}
      name={name}
      label="Image"
      placeholder="Select an image"
      items={images.map((i) => toListboxItem(i))}
      required
      onChange={(id) => {
        const image = images.find((i) => i.id === id)! // if it's selected, it must be present
        const imageSizeGiB = image.size / GiB
        if (diskSizeField.value < imageSizeGiB) {
          diskSizeField.onChange(nearest10(imageSizeGiB))
        }
      }}
    />
  )
}

export function toListboxItem(i: Image, includeProjectSiloIndicator = false): ListboxItem {
  return {
    value: i.id,
    selectedLabel: selectedImageLabel(i),
    label: (
      <ImageLabel image={i} includeProjectSiloIndicator={includeProjectSiloIndicator} />
    ),
  }
}
