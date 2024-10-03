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
  return (
    <ComboboxField
      disabled={disabled}
      control={control}
      name={name}
      label="Image"
      placeholder={
        name === 'siloImageSource' ? 'Select a silo image' : 'Select a project image'
      }
      items={images.map((i) => toImageComboboxItem(i))}
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

export function toImageComboboxItem(
  image: Image,
  includeProjectSiloIndicator = false
): ComboboxItem {
  const { id, name, os, projectId, size, version } = image

  // for metadata showing in the dropdown's options, include the project / silo indicator if requested
  const projectSiloIndicator = includeProjectSiloIndicator
    ? `${projectId ? 'Project' : 'Silo'} image`
    : null
  // filter out undefined metadata and create a `<Slash />`-separated list for each comboboxitem
  const itemMetadata = [os, version, `${bytesToGiB(size, 1)} GiB`, projectSiloIndicator]
    .filter((i) => !!i)
    .map((i, index) => (
      <span key={`${i}`}>
        {index > 0 ? <Slash /> : ''}
        {i}
      </span>
    ))
  return {
    value: id,
    selectedLabel: name,
    label: (
      <>
        <div>{name}</div>
        <div className="text-tertiary selected:text-accent-secondary">{itemMetadata}</div>
      </>
    ),
  }
}
