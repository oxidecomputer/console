import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'

import type { Image } from '@oxide/api'
import type { ListboxItem } from '@oxide/ui'
import { GiB } from '@oxide/util'

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

const Slash = () => <span className="mx-0.5 text-quinary">/</span>

export function toListboxItem(i: Image, includeProjectSiloIndicator = false): ListboxItem {
  const projectSiloIndicator = includeProjectSiloIndicator ? (
    <>
      <Slash /> {i.projectId ? 'Project image' : 'Silo image'}
    </>
  ) : null
  return {
    value: i.id,
    labelString: `${i.name} (${i.os}, ${i.version})`,
    label: (
      <>
        <div>{i.name}</div>
        <div className="text-secondary">
          {i.os} <Slash /> {i.version} {projectSiloIndicator}
        </div>
      </>
    ),
  }
}
