import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'

import type { Image } from '@oxide/api'
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
      items={images.map((i) => {
        return {
          value: i.id,
          labelString: `${i.name} (${i.os}, ${i.version})`,
          label: (
            <>
              <div>{i.name}</div>
              <div className="text-secondary">
                {i.os} <span className="text-quinary">/</span> {i.version}
              </div>
            </>
          ),
        }
      })}
      required
      onChange={(id) => {
        const image = images.find((i) => i.id === id)! // if it's selected, it must be present
        if (diskSizeField.value < (2 * image.size) / GiB) {
          diskSizeField.onChange(Math.ceil(image.size / GiB) * 2)
        }
      }}
    />
  )
}
