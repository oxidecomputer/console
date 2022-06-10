import type { ComponentType } from 'react'
import { useState } from 'react'

import type { GlobalImage } from '@oxide/api'
import {
  CentosDistroIcon,
  DebianDistroIcon,
  FedoraDistroIcon,
  Images24Icon,
  Listbox,
  RadioCard,
  UbuntuDistroIcon,
  WindowsDistroIcon,
} from '@oxide/ui'
import { groupBy } from '@oxide/util'

import type { RadioFieldProps } from './RadioField'
import { RadioField } from './RadioField'

const ArchDistroIcon = (props: { className?: string }) => {
  return (
    <svg viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.9985 0.996994C7.28621 2.74332 6.8566 3.88562 6.06357 5.58003C6.5498 6.09543 7.14662 6.69564 8.11585 7.37352C7.07383 6.94474 6.36304 6.51424 5.83186 6.06752C4.81693 8.18533 3.22683 11.202 0 17C2.53618 15.5358 4.50218 14.6331 6.3344 14.2887C6.25572 13.9503 6.21099 13.5843 6.21403 13.2024L6.21704 13.1211C6.25728 11.4963 7.10254 10.2467 8.10382 10.3316C9.1051 10.4164 9.88339 11.8032 9.84314 13.4281C9.83558 13.7338 9.80109 14.0279 9.74083 14.3007C11.5532 14.6553 13.4981 15.5556 16 17C15.5067 16.0918 15.0664 15.2731 14.6459 14.4933C13.9835 13.98 13.2926 13.3118 11.8834 12.5885C12.852 12.8402 13.5455 13.1306 14.0861 13.4551C9.81081 5.49523 9.4646 4.43753 7.9985 0.996994Z"
        fill="#989A9B"
      />
    </svg>
  )
}

function distroDisplay(image: GlobalImage): GlobalImage & {
  label: string
  Icon: ComponentType<{ className?: string }>
} {
  const distro = image.distribution.toLowerCase()
  if (distro.includes('ubuntu')) {
    return {
      label: 'Ubuntu',
      Icon: UbuntuDistroIcon,
      ...image,
    }
  }
  if (distro.includes('debian')) {
    return {
      label: 'Debian',
      Icon: DebianDistroIcon,
      ...image,
    }
  }
  if (distro.includes('centos')) {
    return {
      label: 'CentOS',
      Icon: CentosDistroIcon,
      ...image,
    }
  }
  if (distro.includes('fedora')) {
    return {
      label: 'Fedora',
      Icon: FedoraDistroIcon,
      ...image,
    }
  }
  if (distro.includes('arch')) {
    return {
      label: 'Arch',
      Icon: ArchDistroIcon,
      ...image,
    }
  }
  if (distro.includes('windows')) {
    return {
      label: 'Windows',
      Icon: WindowsDistroIcon,
      ...image,
    }
  }
  return {
    label: distro.replace(/-/g, ' ').replace(/(?:\s)[a-z]/g, (x) => x.toUpperCase()),
    Icon: Images24Icon,
    ...image,
  }
}

interface ImageSelectFieldProps extends Omit<RadioFieldProps, 'children'> {
  images: GlobalImage[]
}

export function ImageSelectField({ images, ...props }: ImageSelectFieldProps) {
  return (
    <RadioField {...props}>
      {Object.entries(groupBy(images, (i) => i.distribution)).map(
        ([distroName, distroValues]) => (
          <ImageSelect key={distroName} images={distroValues} />
        )
      )}
    </RadioField>
  )
}

interface ImageSelectProps {
  images: GlobalImage[]
}
function ImageSelect({ images, ...props }: ImageSelectProps) {
  const distros = images.map(distroDisplay)
  const { label, id, Icon } = distros[0]
  const [value, setValue] = useState(id)
  return (
    <>
      {distros.length > 1 ? (
        <RadioCard key={label} value={value} className="h-44 w-44 pb-5" {...props}>
          <div className="relative flex h-full flex-col items-center justify-end space-y-4 children:border-secondary first:children:border-b peer-checked:children:border-accent-secondary">
            <Listbox
              items={distros.map((d) => ({ label: d.version, value: d.id }))}
              onChange={(item) => item && setValue(item.value)}
              defaultValue={id}
              className="!absolute top-0 -mt-1 w-full text-mono-xs children:rounded-none children:border-0"
            ></Listbox>
            <Icon className="h-12 w-12 text-tertiary" />
            <span className="text-sans-xl text-secondary">{label}</span>
          </div>
        </RadioCard>
      ) : (
        <RadioCard key={label} value={value} className="h-44 w-44 pb-5" {...props}>
          <div className="flex h-full flex-col items-center justify-end space-y-4">
            <Icon className="h-12 w-12 text-tertiary" />
            <span className="text-sans-xl text-secondary">{label}</span>
          </div>
        </RadioCard>
      )}
    </>
  )
}
