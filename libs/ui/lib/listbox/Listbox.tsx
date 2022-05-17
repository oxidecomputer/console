import type { FC } from 'react'

import cn from 'classnames'

import { useSelect } from 'downshift'

import { DirectionDownIcon } from '../icons'

type Item = { value: string; label: string }

export interface ListboxProps {
  defaultValue?: string
  items: Item[]
  placeholder?: string
  className?: string
  disabled?: boolean
  onChange?: (value: Item | null | undefined) => void
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

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        className={cn(
          `mt-1 flex w-full items-center justify-between rounded border
          py-2 px-4 text-sans-md bg-default border-default
          hover:bg-hover focus:ring-1 focus:ring-accent-secondary
          disabled:cursor-not-allowed disabled:bg-disabled`,
          select.isOpen ? 'text-secondary' : 'text-default'
        )}
        {...select.getToggleButtonProps()}
        {...props}
      >
        <span>{select.selectedItem ? itemToString(select.selectedItem) : placeholder}</span>
        <DirectionDownIcon title="Select" className="ml-5" />
      </button>
      <ul
        className={cn(
          '!children:border-b-secondary absolute left-0 right-0 z-10 mt-1 overflow-y-auto rounded border-0 bg-default children:border children:border-b-0 children:border-default last:children:border-b',
          select.isOpen && 'border'
        )}
        {...select.getMenuProps()}
      >
        {select.isOpen &&
          items.map((item, index) => (
            <li
              key={item.value}
              className={cn(
                'py-2 px-4 text-sans-sm text-default hover:bg-raise',
                select.selectedItem?.value === item.value &&
                  'm-0.5 rounded outline outline-accent-secondary',
                select.highlightedIndex === index && 'bg-raise'
              )}
              {...select.getItemProps({ item, index })}
            >
              {item.label}
            </li>
          ))}
      </ul>
    </div>
  )
}
