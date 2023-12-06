/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useController, type Control } from 'react-hook-form'

import type { Image } from '@oxide/api'
import type { ListboxItem } from '@oxide/ui'
import { bytesToGiB, GiB } from '@oxide/util'

import type { InstanceCreateInput } from 'app/forms/instance-create'

import { ListboxField } from './ListboxField'

type ImageSelectFieldProps = {
  images: Image[]
  control: Control<InstanceCreateInput>
}

export function ImageSelectField({ images, control }: ImageSelectFieldProps) {
  const diskSizeField = useController({ control, name: 'bootDiskSize' }).field
  return (
    <ListboxField
      control={control}
      name="image"
      placeholder="Select an image"
      items={images.map((i) => toListboxItem(i))}
      required
      onChange={(id) => {
        const image = images.find((i) => i.id === id)! // if it's selected, it must be present
        const imageSizeGiB = image.size / GiB
        if (diskSizeField.value < imageSizeGiB) {
          const nearest10 = Math.ceil(imageSizeGiB / 10) * 10
          diskSizeField.onChange(nearest10)
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
  // for the selected listbox item (shown in labelString)
  const condensedImageMetadata = [os, version, formattedSize].filter((i) => !!i).join(', ')
  const metadataForLabelString = condensedImageMetadata.length
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
    labelString: `${name}${metadataForLabelString}`,
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
