import cn from 'classnames'
import { useMultipleSelection, useSelect } from 'downshift'

import { Badge } from '../badge/Badge'
import { FieldLabel } from '../field-label/FieldLabel'
import { SelectArrows6Icon } from '../icons'

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
      <FieldLabel {...select.getLabelProps()} className={showLabel || 'sr-only'}>
        {label}
      </FieldLabel>
      <button
        type="button"
        className={`mt-1 flex h-10 w-full items-center justify-between
          rounded border px-3 text-sans-md text-tertiary border-default
          focus:ring-1 focus:ring-accent`}
        aria-describedby={hintId}
        {...select.getToggleButtonProps(ms.getDropdownProps())}
      >
        <div className="flex flex-wrap items-center gap-1">
          {ms.selectedItems.length > 0
            ? ms.selectedItems?.map((selectedItem, index) => (
                <Badge
                  key={selectedItem.value}
                  variant="default"
                  onClose={() => ms.removeSelectedItem(selectedItem)}
                  {...ms.getSelectedItemProps({ selectedItem, index })}
                >
                  {selectedItem.label}
                </Badge>
              ))
            : placeholder}
        </div>
        <SelectArrows6Icon title="select" />
      </button>
      <ul
        className="absolute left-0 right-0 z-10 mt-1 overflow-y-auto overflow-x-hidden rounded border-0 bg-default children:border children:border-b-0 children:border-default children:border-b-secondary last:children:border-b"
        {...select.getMenuProps()}
      >
        {select.isOpen &&
          items.map((item, index) => (
            <li
              key={item.value}
              className={cn(
                // TODO: FIX THIS
                'py-2 px-4 text-sans-sm text-default hover:bg-raise',
                select.highlightedIndex === index && 'bg-raise',
                ms.selectedItems.includes(item) &&
                  'is-selected !border-1 -mx-[1px] text-accent bg-accent-secondary'
              )}
              {...select.getItemProps({ item, index })}
            >
              {item.label}
            </li>
          ))}
      </ul>
      {hint && hintId && (
        <div id={hintId} className="text-sm mt-1 text-default">
          {hint}
        </div>
      )}
    </div>
  )
}
