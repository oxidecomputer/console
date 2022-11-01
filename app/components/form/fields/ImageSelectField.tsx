import cn from 'classnames'
import { useSelect } from 'downshift'
import type { ComponentType } from 'react'
import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'

import type { GlobalImage } from '@oxide/api'
import {
  CentosDistroIcon,
  DebianDistroIcon,
  FedoraDistroIcon,
  Images24Icon,
  RadioCard,
  RadioGroup,
  SelectArrows6Icon,
  UbuntuDistroIcon,
  WindowsDistroIcon,
} from '@oxide/ui'
import { classed, groupBy } from '@oxide/util'

import type { InstanceCreateInput } from 'app/forms/instance-create'

const ArchDistroIcon = (props: { className?: string }) => {
  return (
    <svg viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.9985 0.996994C7.28621 2.74332 6.8566 3.88562 6.06357 5.58003C6.5498 6.09543 7.14662 6.69564 8.11585 7.37352C7.07383 6.94474 6.36304 6.51424 5.83186 6.06752C4.81693 8.18533 3.22683 11.202 0 17C2.53618 15.5358 4.50218 14.6331 6.3344 14.2887C6.25572 13.9503 6.21099 13.5843 6.21403 13.2024L6.21704 13.1211C6.25728 11.4963 7.10254 10.2467 8.10382 10.3316C9.1051 10.4164 9.88339 11.8032 9.84314 13.4281C9.83558 13.7338 9.80109 14.0279 9.74083 14.3007C11.5532 14.6553 13.4981 15.5556 16 17C15.5067 16.0918 15.0664 15.2731 14.6459 14.4933C13.9835 13.98 13.2926 13.3118 11.8834 12.5885C12.852 12.8402 13.5455 13.1306 14.0861 13.4551C9.81081 5.49523 9.4646 4.43753 7.9985 0.996994Z"
        fill="currentColor"
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
    return { label: 'Ubuntu', Icon: UbuntuDistroIcon }
  }
  if (distro.includes('debian')) {
    return { label: 'Debian', Icon: DebianDistroIcon }
  }
  if (distro.includes('centos')) {
    return { label: 'CentOS', Icon: CentosDistroIcon }
  }
  if (distro.includes('fedora')) {
    return { label: 'Fedora', Icon: FedoraDistroIcon }
  }
  if (distro.includes('arch')) {
    return { label: 'Arch', Icon: ArchDistroIcon }
  }
  if (distro.includes('windows')) {
    return { label: 'Windows', Icon: WindowsDistroIcon }
  }
  return {
    label: distro.replace(/-/g, ' ').replace(/(?:\s)[a-z]/g, (x) => x.toUpperCase()),
    Icon: Images24Icon,
  }
}

type ImageSelectFieldProps = {
  required: boolean
  images: GlobalImage[]
  control: Control<InstanceCreateInput>
}

export function ImageSelectField({ images, control, required }: ImageSelectFieldProps) {
  return (
    <RadioGroup name="globalImage" aria-label="Global image" required={required}>
      {groupBy(images, (i) => i.distribution).map(([distroName, distroValues]) => (
        <ImageSelect key={distroName} images={distroValues} control={control} />
      ))}
    </RadioGroup>
  )
}

const Outline = classed.div`absolute z-10 h-full w-full rounded border border-accent pointer-events-none`

function ImageSelect({
  images,
  control,
}: {
  images: GlobalImage[]
  control: Control<InstanceCreateInput>
}) {
  const distros = images.map((image) => ({ ...image, ...distroDisplay(image) }))
  const { label, Icon } = distros[0]

  const {
    field: { value, onChange },
  } = useController({ control, name: 'globalImage' })

  // current distro is the one from the field value *if* it exists in the list
  // of distros. default to first distro in the list
  const currentDistro = distros.find((d) => d.id === value)?.id || distros[0].id

  const select = useSelect({
    initialSelectedItem: distros[0],
    items: distros,
    itemToString: (distro) => distro?.version || '',
    onSelectedItemChange(changes) {
      if (changes.selectedItem) {
        onChange(changes.selectedItem.id)
      }
    },
  })
  const onClick = () => {
    if (select.selectedItem) {
      onChange(select.selectedItem.id)
    }
  }

  const selected = currentDistro === value
  return (
    <div className="relative">
      <RadioCard
        name="globalImage"
        value={currentDistro}
        className={cn(
          'relative h-44 w-44 pb-0',
          selected && 'bg-accent-secondary hover:bg-accent-secondary-hover'
        )}
        onClick={onClick}
      >
        <div className=" relative flex h-full flex-col items-center justify-end space-y-3 !pb-4">
          <button
            type="button"
            {...select.getToggleButtonProps()}
            className={cn(
              'absolute top-0 flex h-10 w-full items-center justify-between border-b px-3 text-sans-md text-secondary border-secondary',
              selected ? 'text-accent' : 'text-tertiary'
            )}
          >
            <span>{select.selectedItem?.version}</span>
            <SelectArrows6Icon
              title="Select"
              className={selected ? 'text-accent-tertiary' : 'text-quaternary'}
            />
          </button>
          <Icon className={cn('h-12 w-12', selected ? 'text-accent' : 'text-quaternary')} />
          <span className={cn('text-sans-xl', selected ? 'text-accent' : 'text-tertiary')}>
            {label}
          </span>
        </div>
      </RadioCard>
      <ul
        className={cn(
          '!children:border-b-secondary absolute -top-2 left-0 right-0 max-h-[17.5rem] -translate-y-full overflow-y-auto rounded shadow-2xl bg-raise border-secondary focus:outline-none children:border-b children:border-secondary last:children:border-b-0',
          select.isOpen && 'border'
        )}
        {...select.getMenuProps()}
      >
        {select.isOpen &&
          distros.map((distro, index) => (
            <li key={index} className="relative">
              {selected && select.selectedItem?.id === distro.id && <Outline />}
              <div
                key={index}
                className={cn(
                  'cursor-pointer p-3 text-sans-md text-default hover:bg-raise-hover',
                  selected &&
                    select.selectedItem?.id === distro.id &&
                    'text-accent bg-accent-secondary hover:bg-accent-secondary-hover',
                  select.highlightedIndex === index && 'bg-raise-hover'
                )}
                {...select.getItemProps({ item: distro, index })}
              >
                {distro.version}
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}
