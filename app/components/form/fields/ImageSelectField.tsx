import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'

import type { GlobalImage, Image } from '@oxide/api'
import { GiB } from '@oxide/util'

import type { InstanceCreateInput } from 'app/forms/instance-create'

import { ListboxField } from './ListboxField'

type Img = Image | GlobalImage

type ImageSelectFieldProps = {
  images: Img[]
  control: Control<InstanceCreateInput>
}

export function ImageSelectField({ images, control }: ImageSelectFieldProps) {
  const diskSizeField = useController({ control, name: 'bootDiskSize' }).field
  return (
    <ListboxField
      control={control}
      name="image"
      items={images.map((i) => {
        const os = 'distribution' in i ? i.distribution : i.os
        return { value: i.id, label: `${i.name} (os: ${os}, version: ${i.version})` }
      })}
      required
      onChange={(id) => {
        const image = images.find((i) => i.id === id)! // if it's selected, it must be present
        console.log({ id, image, diskSize: diskSizeField.value })
        if (diskSizeField.value < (2 * image.size) / GiB) {
          diskSizeField.onChange(Math.ceil(image.size / GiB) * 2)
        }
      }}
    />
  )
}
