import type { ComponentType } from 'react'

import type { GlobalImage } from '@oxide/api'
import {
  CentosDistroIcon,
  DebianDistroIcon,
  FedoraDistroIcon,
  Images24Icon,
  RadioCard,
  UbuntuDistroIcon,
  WindowsDistroIcon,
} from '@oxide/ui'

import type { RadioFieldProps } from './RadioField'
import { RadioField } from './RadioField'

const ArchDistroIcon = () => {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.9985 0.996994C7.28621 2.74332 6.8566 3.88562 6.06357 5.58003C6.5498 6.09543 7.14662 6.69564 8.11585 7.37352C7.07383 6.94474 6.36304 6.51424 5.83186 6.06752C4.81693 8.18533 3.22683 11.202 0 17C2.53618 15.5358 4.50218 14.6331 6.3344 14.2887C6.25572 13.9503 6.21099 13.5843 6.21403 13.2024L6.21704 13.1211C6.25728 11.4963 7.10254 10.2467 8.10382 10.3316C9.1051 10.4164 9.88339 11.8032 9.84314 13.4281C9.83558 13.7338 9.80109 14.0279 9.74083 14.3007C11.5532 14.6553 13.4981 15.5556 16 17C15.5067 16.0918 15.0664 15.2731 14.6459 14.4933C13.9835 13.98 13.2926 13.3118 11.8834 12.5885C12.852 12.8402 13.5455 13.1306 14.0861 13.4551C9.81081 5.49523 9.4646 4.43753 7.9985 0.996994Z"
        fill="#989A9B"
      />
    </svg>
  )
}

function distroDisplay(image: GlobalImage): {
  label: string
  Icon: ComponentType<{ className?: string }>
} {
  const distro = image.distribution.toLowerCase()
  if (distro.includes('ubuntu')) {
    return {
      label: 'Ubuntu',
      Icon: UbuntuDistroIcon,
    }
  }
  if (distro.includes('debian')) {
    return {
      label: 'Debian',
      Icon: DebianDistroIcon,
    }
  }
  if (distro.includes('centos')) {
    return {
      label: 'CentOS',
      Icon: CentosDistroIcon,
    }
  }
  if (distro.includes('fedora')) {
    return {
      label: 'Fedora',
      Icon: FedoraDistroIcon,
    }
  }
  if (distro.includes('arch')) {
    return {
      label: 'Arch',
      Icon: ArchDistroIcon,
    }
  }
  if (distro.includes('windows')) {
    return {
      label: 'Windows',
      Icon: WindowsDistroIcon,
    }
  }
  return {
    label: distro.replace(/-/g, ' ').replace(/(?:\s)[a-z]/g, (x) => x.toUpperCase()),
    Icon: Images24Icon,
  }
}

interface ImageSelectFieldProps extends Omit<RadioFieldProps, 'children'> {
  images: GlobalImage[]
}

export function ImageSelectField({ images, ...props }: ImageSelectFieldProps) {
  return (
    <RadioField {...props}>
      {images.map((image) => (
        <ImageSelect key={image.id} image={image} />
      ))}
    </RadioField>
  )
}

interface ImageSelectProps {
  image: GlobalImage
}
function ImageSelect({ image }: ImageSelectProps) {
  const { label, Icon } = distroDisplay(image)
  return (
    <RadioCard value={image.id} className="h-44 w-44 pb-6">
      <div className="flex h-full flex-col items-center justify-end space-y-4">
        <Icon className="h-12 w-12 text-tertiary" />
        <span className="text-sans-xl text-secondary">{label}</span>
      </div>
    </RadioCard>
  )
}
