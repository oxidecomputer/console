import type { FC } from 'react'
import React from 'react'
import cn from 'classnames'

import { useSelect } from 'downshift'

import { DirectionDownIcon } from '../icons'
import { FieldTitle } from '../field-title/FieldTitle'

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
}

export const Dropdown: FC<DropdownProps> = ({
  defaultValue,
  hint,
  label,
  items,
  placeholder,
  showLabel = true,
  className,
}) => {
  const itemToString = (item: Item | null) => (item ? item.label : '')
  const select = useSelect({
    initialSelectedItem: items.find((i) => i.value === defaultValue) || null,
    items,
    itemToString,
  })
  const hintId = hint ? `${select.getLabelProps().id}-hint` : null

  return (
    <div className={cn('relative', className)}>
      <FieldTitle
        {...select.getLabelProps()}
        className={cn(!showLabel && 'sr-only')}
      >
        {label}
      </FieldTitle>
      <button
        type="button"
        className={cn(
          `flex items-center justify-between mt-1 py-2 px-4 w-full
          text-sans-md bg-default hover:bg-raise border border-default
          focus:ring-1 focus:ring-accent-secondary rounded-sm`,
          select.isOpen ? 'text-secondary' : 'text-default'
        )}
        aria-describedby={hintId}
        {...select.getToggleButtonProps()}
      >
        {select.selectedItem
          ? itemToString(select.selectedItem)
          : placeholder || label}
        <DirectionDownIcon title="Select" className="ml-5" />
      </button>
      <ul
        className={cn(
          'z-10 mt-1 absolute left-0 right-0 overflow-y-auto bg-default border-0 rounded-sm children:border children:border-b-0 children:border-default !children:border-b-secondary last:children:border-b',
          select.isOpen && 'border'
        )}
        {...select.getMenuProps()}
      >
        {select.isOpen &&
          items.map((item, index) => (
            <li
              key={item.value}
              className={cn(
                'py-2 px-4 text-sm text-gray-50 hover:bg-raise text-default',
                select.selectedItem?.value === item.value &&
                  'outline outline-accent-secondary m-0.5 rounded-sm',
                select.highlightedIndex === index && 'bg-raise'
              )}
              {...select.getItemProps({ item, index })}
            >
              {item.label}
            </li>
          ))}
      </ul>
      {hint && hintId && (
        <div id={hintId} className="text-mono-sm mt-1 text-secondary">
          {hint}
        </div>
      )}
    </div>
  )
}
