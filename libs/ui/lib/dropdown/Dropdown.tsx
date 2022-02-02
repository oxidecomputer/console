import type { FC } from 'react'
import React from 'react'
import cn from 'classnames'

import { useSelect } from 'downshift'

import { DirectionDownIcon } from '../icons'

type Item = { value: string; label: string }

export interface DropdownProps {
  defaultValue?: string
  hint?: string | React.ReactNode
  /**
   * Required for accessibility. Description of the dropdown.
   */
  label: string
  items: Item[]
  placeholder?: string
  /**
   * Whether to show label to sighted users
   */
  showLabel?: boolean
  className?: string
  onChange?: (value: Item | null | undefined) => void
}

export const Dropdown: FC<DropdownProps> = ({
  defaultValue,
  hint,
  label,
  items,
  placeholder,
  showLabel = true,
  className,
  onChange,
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
  const hintId = hint ? `${select.getLabelProps().id}-hint` : null

  return (
    <div className={cn('relative', className)}>
      <label
        className={showLabel ? 'text-white text-sm' : 'sr-only'}
        {...select.getLabelProps()}
      >
        {label}
      </label>
      <button
        type="button"
        className={`flex items-center justify-between mt-1 py-2 px-4 w-full
          text-base text-white bg-gray-400 hover:bg-gray-400
          focus:ring-1 focus:ring-green-500`}
        aria-describedby={hintId}
        {...select.getToggleButtonProps()}
      >
        {select.selectedItem
          ? itemToString(select.selectedItem)
          : placeholder || label}
        <DirectionDownIcon title="Select" className="ml-5" />
      </button>
      <ul
        className="z-10 mt-1 absolute left-0 right-0 overflow-y-auto bg-gray-500 focus:ring-1 focus:ring-green-500"
        {...select.getMenuProps()}
      >
        {select.isOpen &&
          items.map((item, index) => (
            <li
              key={item.value}
              className={cn(
                'py-2 px-4 text-sm text-gray-50 focus:bg-gray-400 focus:ring-1 focus:ring-green-500',
                select.highlightedIndex === index && 'bg-gray-400'
              )}
              {...select.getItemProps({ item, index })}
            >
              {item.label}
            </li>
          ))}
      </ul>
      {hint && hintId && (
        <div id={hintId} className="text-sm mt-1 text-gray-50">
          {hint}
        </div>
      )}
    </div>
  )
}
