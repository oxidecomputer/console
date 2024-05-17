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
import { nearest10 } from '~/util/math'
import { bytesToGiB, GiB } from '~/util/units'

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

const Slash = () => (
  <span className="mx-1 text-quinary selected:text-accent-disabled">/</span>
)

export function toListboxItem(i: Image, includeProjectSiloIndicator = false): ListboxItem {
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
