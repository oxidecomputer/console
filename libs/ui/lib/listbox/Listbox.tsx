import cn from 'classnames'
import { useSelect } from 'downshift'
import type { FC } from 'react'

import { SelectArrows6Icon } from '@oxide/ui'

export type ListboxItem = { value: string; label: string }

export interface ListboxProps {
  defaultValue?: string
  items: ListboxItem[]
  placeholder?: string
  className?: string
  disabled?: boolean
  onChange?: (value: ListboxItem | null | undefined) => void
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
  const itemToString = (item: ListboxItem | null) => (item ? item.label : '')
  const select = useSelect({
    initialSelectedItem: items.find((i) => i.value === defaultValue) || null,
    items,
    itemToString,
    onSelectedItemChange(changes) {
      onChange?.(changes.selectedItem)
    },
  })

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        className={cn(
          `flex h-10 w-full items-center justify-between rounded
          border px-3 text-sans-md bg-default border-default
          focus:outline-none focus:ring-2 focus:ring-accent-secondary
          disabled:cursor-not-allowed disabled:bg-disabled`,
          select.isOpen ? 'ring-2 text-secondary ring-accent-secondary' : 'text-default'
        )}
        {...select.getToggleButtonProps()}
        {...props}
      >
        <span>{select.selectedItem ? itemToString(select.selectedItem) : placeholder}</span>

        <div className="ml-5 flex h-[calc(100%-12px)] items-center border-l border-secondary">
          <SelectArrows6Icon title="Select" className="ml-3 w-2 text-tertiary" />
        </div>
      </button>
      <ul
        className={cn('ox-menu !children:border-b-secondary', select.isOpen && 'border')}
        {...select.getMenuProps()}
      >
        {select.isOpen &&
          items.map((item, index) => (
            <div key={index} className="relative">
              <li
                key={item.value}
                className={cn('ox-menu-item', {
                  'is-selected': select.selectedItem?.value === item.value,
                  'bg-raise-hover': select.highlightedIndex === index,
                })}
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
