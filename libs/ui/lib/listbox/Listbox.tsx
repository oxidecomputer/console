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
          `flex h-[2.625rem] w-full items-center justify-between rounded
          border px-3 text-sans-md bg-default border-default
          focus:outline-none focus:ring-2 focus:ring-accent-secondary
          disabled:cursor-not-allowed disabled:bg-disabled`,
          select.isOpen ? 'ring-2 text-secondary ring-accent-secondary' : 'text-default'
        )}
        {...select.getToggleButtonProps()}
        {...props}
      >
        <span>{select.selectedItem ? itemToString(select.selectedItem) : placeholder}</span>

        <div className="ox-menu">
          <SelectArrows6Icon title="Select" className="ml-3 w-2 text-tertiary" />
        </div>
      </button>
      <ul
        className={cn(
          '!children:border-b-secondary absolute left-0 right-0 z-10 mt-3 max-h-[17.5rem] overflow-y-auto rounded shadow-2xl bg-raise border-secondary focus:outline-none children:border-b children:border-secondary last:children:border-b-0',
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
                  'ox-menu-item',
                  select.selectedItem?.value === item.value && 'is-selected',
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
