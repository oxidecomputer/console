import type { FC } from 'react'
import React from 'react'
import cn from 'classnames'

import { useSelect } from 'downshift'

import { DirectionDownIcon } from '../icons'
import { FieldLabel } from '../field-label/FieldLabel'

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
      <FieldLabel {...select.getLabelProps()} className={cn(!showLabel && 'sr-only')}>
        {label}
      </FieldLabel>
      <button
        type="button"
        className={cn(
          `mt-1 flex w-full items-center justify-between rounded border
          py-2 px-4 text-sans-md bg-default border-default
          hover:bg-raise focus:ring-1 focus:ring-accent-secondary`,
          select.isOpen ? 'text-secondary' : 'text-default'
        )}
        aria-describedby={hintId}
        {...select.getToggleButtonProps()}
      >
        {select.selectedItem ? itemToString(select.selectedItem) : placeholder || label}
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
      {hint && hintId && (
        <div id={hintId} className="mt-1 text-mono-sm text-secondary">
          {hint}
        </div>
      )}
    </div>
  )
}
