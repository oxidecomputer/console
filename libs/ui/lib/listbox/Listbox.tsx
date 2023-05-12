import cn from 'classnames'
import { useSelect } from 'downshift'
import type { ReactElement } from 'react'

import { SelectArrows6Icon } from '@oxide/ui'

export type ListboxItem = {
  value: string
} & (
  | {
      label: string
      labelString?: never
    }
  | {
      label: ReactElement
      /**
       * Required when `label` is a `ReactElement` because downshift needs a
       * string to display in the button when the item is selected.
       */
      labelString: string
    }
)

export interface ListboxProps {
  defaultValue?: string
  items: ListboxItem[]
  placeholder?: string
  className?: string
  disabled?: boolean
  onChange?: (value: ListboxItem | null | undefined) => void
  onBlur?: () => void
  hasError?: boolean
  name?: string
}

export const Listbox = ({
  defaultValue,
  items,
  placeholder,
  className,
  onChange,
  onBlur,
  hasError = false,
  ...props
}: ListboxProps) => {
  const itemToString = (item: ListboxItem | null) => {
    if (!item) return ''
    // not sure why TS isn't able to infer that labelString must be present when
    // label isn't a string. it enforces it correctly on the props side
    if (typeof item.label !== 'string') return item.labelString!
    return item.label
  }
  const select = useSelect({
    initialSelectedItem: items.find((i) => i.value === defaultValue) || null,
    items,
    itemToString,
    onSelectedItemChange(changes) {
      onChange?.(changes.selectedItem)
    },
    onIsOpenChange(changes) {
      // we want a general onBlur to trigger validation. we'll see if this is
      // general enough
      if (changes.type === '__menu_blur__') {
        onBlur?.()
      }
    },
  })

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        className={cn(
          `flex h-10 w-full items-center justify-between
          rounded border px-3 text-sans-md`,
          hasError ? 'focus-error border-destructive' : 'border-default',
          select.isOpen && 'ring-2 ring-accent-secondary',
          select.isOpen && hasError && 'ring-error-secondary',
          props.disabled ? 'cursor-not-allowed text-disabled bg-disabled' : 'bg-default'
        )}
        {...select.getToggleButtonProps()}
        {...props}
      >
        {select.selectedItem ? (
          <span>{itemToString(select.selectedItem)}</span>
        ) : (
          <span className="text-quaternary">{placeholder}</span>
        )}

        <div className="ml-3 flex h-[calc(100%-12px)] items-center border-l border-secondary">
          <SelectArrows6Icon title="Select" className="ml-3 w-2 text-tertiary" />
        </div>
      </button>
      <ul
        className={cn(
          'ox-menu mt-3 overflow-y-auto !outline-none',
          !select.isOpen && 'hidden'
        )}
        {...select.getMenuProps()}
      >
        {select.isOpen &&
          (items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} className="relative border-b border-secondary last:border-0">
                <li
                  key={item.value}
                  className={cn('ox-menu-item', {
                    'is-selected': select.selectedItem?.value === item.value,
                    'is-highlighted': select.highlightedIndex === index,
                  })}
                  {...select.getItemProps({ item, index })}
                >
                  {item.label}
                </li>
              </div>
            ))
          ) : (
            <div className="ox-menu-item py-3 text-center text-secondary">No items</div>
          ))}
      </ul>
    </div>
  )
}
