import cn from 'classnames'
import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'

import type { Image } from '@oxide/api'
import { RadioCard, RadioGroup } from '@oxide/ui'
import { GiB } from '@oxide/util'

import type { InstanceCreateInput } from 'app/forms/instance-create'

type ImageSelectFieldProps = {
  required: boolean
  images: Image[]
  control: Control<InstanceCreateInput>
}

export function ImageSelectField({ images, control, required }: ImageSelectFieldProps) {
  return (
    <RadioGroup name="globalImage" aria-label="Image" required={required}>
      {images.map((image) => (
        <ImageCard key={image.id} image={image} control={control} />
      ))}
    </RadioGroup>
  )
}

type ImageCardProps = {
  image: Image
  control: Control<InstanceCreateInput>
}

function ImageCard({ image, control }: ImageCardProps) {
  const diskSizeField = useController({ control, name: 'bootDiskSize' }).field
  const imageField = useController({ control, name: 'image' }).field

  const selected = imageField.value === image.id

  function onChange(selectedItem: Image | undefined | null) {
    if (selectedItem) {
      imageField.onChange(selectedItem.id)
      // if the current disk size is less than 2x the image size, bump it up
      if (diskSizeField.value < (2 * selectedItem.size) / GiB) {
        diskSizeField.onChange(Math.ceil(selectedItem.size / GiB) * 2)
      }
    }
  }

  return (
    <RadioCard
      key={image.id}
      value={image.id}
      name="globalImage"
      onClick={() => onChange(image)}
      className={cn(
        'relative w-44 pb-0',
        selected && 'bg-accent-secondary hover:bg-accent-secondary-hover'
      )}
    >
      <div>{image.name}</div>
      <div>{image.os}</div>
      <div>{image.version}</div>
    </RadioCard>
  )
}
