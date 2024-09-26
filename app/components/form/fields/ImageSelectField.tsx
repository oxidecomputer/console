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
import type { ComboboxItem } from '~/ui/lib/Combobox'
import { Slash } from '~/ui/lib/Slash'
import { nearest10 } from '~/util/math'
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
  const placeholder =
    name === 'siloImageSource' ? 'Select a silo image' : 'Select a project image'
  return (
    <ComboboxField
      disabled={disabled}
      control={control}
      name={name}
      label="Image"
      placeholder={placeholder}
      items={images.map((i) => toComboboxItem(i))}
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

export function toComboboxItem(
  i: Image,
  includeProjectSiloIndicator = false
): ComboboxItem {
  const { name, os, projectId, size, version } = i
  const formattedSize = `${bytesToGiB(size, 1)} GiB`

  // filter out any undefined metadata and create a comma-separated list
  // for the selected listbox item (shown in selectedLabel)
  const condensedImageMetadata = [os, version, formattedSize].filter((i) => !!i).join(', ')
  const metadataForSelectedLabel = condensedImageMetadata.length
    ? ` (${condensedImageMetadata})`
    : ''

  // for metadata showing in the dropdown's options, include the project / silo indicator if requested
  const projectSiloIndicator = includeProjectSiloIndicator
    ? `${projectId ? 'Project' : 'Silo'} image`
    : null
  // filter out undefined metadata here, as well, and create a `<Slash />`-separated list
  // for the listbox item (shown for each item in the dropdown)
  const metadataForLabel = [os, version, formattedSize, projectSiloIndicator]
    .filter((i) => !!i)
    .map((i, index) => (
      <span key={`${i}`}>
        {index > 0 ? <Slash /> : ''}
        {i}
      </span>
    ))
  return {
    value: i.id,
    selectedLabel: `${name}${metadataForSelectedLabel}`,
    label: (
      <>
        <div>{name}</div>
        <div className="text-tertiary selected:text-accent-secondary">
          {metadataForLabel}
        </div>
      </>
    ),
  }
}
