import React from 'react'
import cn from 'classnames'

import { useMultipleSelection, useSelect } from 'downshift'

import { Badge } from '../badge/Badge'
import { DirectionDownIcon } from '../icons'

type Item = { value: string; label: string }

export interface MultiSelectProps {
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
}

const itemToString = (item: Item | null) => (item ? item.label : '')

export const MultiSelect = ({
  hint,
  label,
  items,
  placeholder,
  showLabel = true,
}: MultiSelectProps) => {
  const ms = useMultipleSelection<Item>()
  const select = useSelect({
    items,
    itemToString,
    selectedItem: null,
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return
      if (ms.selectedItems.includes(selectedItem)) {
        ms.removeSelectedItem(selectedItem)
      } else {
        ms.addSelectedItem(selectedItem)
      }
    },
    // TODO: prevent isOpen toggling when you click selected items in button
    stateReducer: (state, { type, changes }) => {
      // this prevents the menu from being closed when the user selects an item with 'Enter' or mouse
      switch (type) {
        case useSelect.stateChangeTypes.MenuKeyDownEnter:
        case useSelect.stateChangeTypes.MenuKeyDownSpaceButton:
        case useSelect.stateChangeTypes.ItemClick:
          return {
            ...changes, // default Downshift new state changes on item selection.
            isOpen: state.isOpen, // but keep menu open.
            highlightedIndex: state.highlightedIndex, // with the item highlighted.
          }
        default:
          return changes // otherwise business as usual.
      }
    },
  })
  const hintId = hint ? `${select.getLabelProps().id}-hint` : null

  return (
    <div className="relative">
      <label
        className={showLabel ? 'text-white text-sm' : 'sr-only'}
        {...select.getLabelProps()}
      >
        {label}
      </label>
      <button
        type="button"
        className={`flex items-center justify-between mt-1 py-2 px-4 w-full
          text-base text-white border border-gray-400 rounded
          focus:ring-1 focus:ring-green-500`}
        aria-describedby={hintId}
        {...select.getToggleButtonProps(ms.getDropdownProps())}
      >
        <div className="flex flex-wrap gap-1">
          {ms.selectedItems.length > 0
            ? ms.selectedItems?.map((selectedItem, index) => (
                <Badge
                  key={selectedItem.value}
                  variant="dim"
                  onClose={() => ms.removeSelectedItem(selectedItem)}
                  {...ms.getSelectedItemProps({ selectedItem, index })}
                >
                  {selectedItem.label}
                </Badge>
              ))
            : placeholder || label}
        </div>
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
                select.highlightedIndex === index && 'bg-gray-400',
                ms.selectedItems.includes(item) && '!text-green-500'
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
