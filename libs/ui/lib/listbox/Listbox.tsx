import { FloatingPortal, size, useFloating } from '@floating-ui/react'
import { Listbox as Select } from '@headlessui/react'
import cn from 'classnames'
import type { ReactElement } from 'react'
import { useState } from 'react'

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
  onChange?: (value: string | null | undefined) => void
  onBlur?: () => void
  hasError?: boolean
  name?: string
}

export const Listbox = ({
  defaultValue,
  items,
  placeholder = 'Select an option',
  className,
  onChange,
  hasError = false,
  // onBlur,
  ...props
}: ListboxProps) => {
  const { refs, floatingStyles } = useFloating({
    middleware: [
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          })
        },
      }),
    ],
  })

  const getItem = (value: string | undefined) =>
    items.find((i) => i.value === value) || null

  const [selected, setSelected] = useState(defaultValue)

  const handleChange = (value: string) => {
    setSelected(value)
    onChange && onChange(value)
  }

  const selectedItem = getItem(selected)
  const selectedLabel = selectedItem
    ? selectedItem.labelString
      ? selectedItem.labelString
      : selectedItem.label
    : null

  return (
    <div className={cn('relative', className)}>
      <Select value={selected} onChange={handleChange}>
        {({ open }) => (
          <>
            <Select.Button
              ref={refs.setReference}
              className={cn(
                `flex h-10 w-full items-center justify-between
                    rounded border text-sans-md`,
                hasError
                  ? 'focus-error border-error-secondary hover:border-error'
                  : 'border-default hover:border-hover',
                open && 'ring-2 ring-accent-secondary',
                open && hasError && 'ring-error-secondary',
                props.disabled
                  ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
                  : 'bg-default'
              )}
            >
              <div className="px-3">
                {selected ? (
                  selectedLabel
                ) : (
                  <span className="text-quaternary">{placeholder}</span>
                )}
              </div>
              <div className="ml-3 flex h-[calc(100%-12px)] items-center border-l px-3 border-secondary">
                <SelectArrows6Icon title="Select" className="w-2 text-tertiary" />
              </div>
            </Select.Button>
            <FloatingPortal>
              <Select.Options
                ref={refs.setFloating}
                style={floatingStyles}
                className="ox-menu pointer-events-auto z-50 mt-3 overflow-y-auto !outline-none"
              >
                {items.map((item) => (
                  <Select.Option
                    key={item.value}
                    value={item.value}
                    className="relative border-b border-secondary last:border-0"
                  >
                    {({ active, selected }) => (
                      <div
                        className={cn(
                          'ox-menu-item text-secondary',
                          selected && 'is-selected',
                          active && 'is-highlighted'
                        )}
                      >
                        {item.label}
                      </div>
                    )}
                  </Select.Option>
                ))}
              </Select.Options>
            </FloatingPortal>
          </>
        )}
      </Select>
    </div>
  )
}

// export const Listbox = ({
//   defaultValue,
//   items,
//   placeholder,
//   className,
//   onChange,
//   onBlur,
//   hasError = false,
//   ...props
// }: ListboxProps) => {
//   const itemToString = (item: ListboxItem | null) => {
//     if (!item) return ''
//     // not sure why TS isn't able to infer that labelString must be present when
//     // label isn't a string. it enforces it correctly on the props side
//     if (typeof item.label !== 'string') return item.labelString!
//     return item.label
//   }
//   const select = useSelect({
//     initialSelectedItem: items.find((i) => i.value === defaultValue) || null,
//     items,
//     itemToString,
//     onSelectedItemChange(changes) {
//       onChange?.(changes.selectedItem)
//     },
//     onIsOpenChange(changes) {
//       // we want a general onBlur to trigger validation. we'll see if this is
//       // general enough
//       if (changes.type === '__menu_blur__') {
//         onBlur?.()
//       }
//     },
//   })
//
//   return (
//     <div className={cn('relative', className)}>
//       <button
//         type="button"
//         className={cn(
//           `flex h-10 w-full items-center justify-between
//           rounded border px-3 text-sans-md`,
//           hasError
//             ? 'focus-error border-error-secondary hover:border-error'
//             : 'border-default hover:border-hover',
//           select.isOpen && 'ring-2 ring-accent-secondary',
//           select.isOpen && hasError && 'ring-error-secondary',
//           props.disabled
//             ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
//             : 'bg-default'
//         )}
//         {...select.getToggleButtonProps()}
//         {...props}
//       >
//         {select.selectedItem ? (
//           <span>{itemToString(select.selectedItem)}</span>
//         ) : (
//           <span className="text-quaternary">{placeholder}</span>
//         )}
//
//         <div className="ml-3 flex h-[calc(100%-12px)] items-center border-l border-secondary">
//           <SelectArrows6Icon title="Select" className="ml-3 w-2 text-tertiary" />
//         </div>
//       </button>
//       <ul
//         className={cn(
//           'ox-menu mt-3 overflow-y-auto !outline-none',
//           !select.isOpen && 'hidden'
//         )}
//         {...select.getMenuProps()}
//       >
//         {select.isOpen &&
//           (items.length > 0 ? (
//             items.map((item, index) => (
//               <div key={index} className="relative border-b border-secondary last:border-0">
//                 <li
//                   key={item.value}
//                   className={cn('ox-menu-item', {
//                     'is-selected': select.selectedItem?.value === item.value,
//                     'is-highlighted': select.highlightedIndex === index,
//                   })}
//                   {...select.getItemProps({ item, index })}
//                 >
//                   {item.label}
//                 </li>
//               </div>
//             ))
//           ) : (
//             <div className="ox-menu-item py-3 text-center text-secondary">No items</div>
//           ))}
//       </ul>
//     </div>
//   )
// }
