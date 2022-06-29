import cn from 'classnames'
import { useSelect } from 'downshift'
import type { FC } from 'react'

import { SelectArrows6Icon } from '@oxide/ui'
import { classed } from '@oxide/util'

type Item = { value: string; label: string }

export interface ListboxProps {
  defaultValue?: string
  items: Item[]
  placeholder?: string
  className?: string
  disabled?: boolean
  onChange?: (value: Item | null | undefined) => void
  name?: string
}

export const Listbox: FC<ListboxProps> = ({
  defaultValue,
  items,
  placeholder,
  className,
  onChange,
  ...props
}) => {
  const itemToString = (item: Item | null) => (item ? item.label : '')
  const select = useSelect({
    initialSelectedItem: items.find((i) => i.value === defaultValue) || null,
    items,
    itemToString,
    onSelectedItemChange(changes) {
      onChange?.(changes.selectedItem)
    },
  })

  const Outline = classed.div`absolute z-10 h-full w-full rounded border border-accent pointer-events-none`

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        className={cn(
          `flex w-full items-center justify-between rounded border
          h-[2.625rem] px-3 text-sans-md bg-default border-default
          focus:outline-none focus:ring-2 focus:ring-accent-secondary
          disabled:cursor-not-allowed disabled:bg-disabled`,
          select.isOpen ? 'text-secondary ring-2 ring-accent-secondary' : 'text-default'
        )}
        {...select.getToggleButtonProps()}
        {...props}
      >
        <span>{select.selectedItem ? itemToString(select.selectedItem) : placeholder}</span>

        <div className="ml-5 flex h-[calc(100%-12px)] border-l border-secondary items-center">
          <SelectArrows6Icon title="Select" className="ml-3 w-2 text-tertiary" />
        </div>
      </button>
      <ul
        className={cn(
          '!children:border-b-secondary absolute left-0 right-0 z-10 mt-3 overflow-y-auto rounded border-secondary bg-raise children:border-b children:border-secondary last:children:border-b-0 focus:outline-none max-h-[17.5rem]',
          select.isOpen && 'border'
        )}
        {...select.getMenuProps()}
      >
        {select.isOpen &&
          items.map((item, index) => (
            <div key={index} className="relative">
              {item.value === select.selectedItem?.value && <Outline />}

              <li
                key={item.value}
                className={cn(
                  'p-3 text-sans-sm text-default hover:bg-raise-hover cursor-pointer',
                  select.selectedItem?.value === item.value &&
                    'text-accent bg-accent-secondary hover:bg-accent-secondary-hover',
                  select.highlightedIndex === index && 'bg-raise-hover'
                )}
                {...select.getItemProps({ item, index })}
              >
                {item.label}
              </li>
            </div>
          ))}
      </ul>
    </div>
  )
}
