import { FloatingPortal, flip, offset, size, useFloating } from '@floating-ui/react'
import { Listbox as Select } from '@headlessui/react'
import cn from 'classnames'
import type { ReactElement } from 'react'

import { FieldLabel, SpinnerLoader, TextInputHint } from '@oxide/ui'
import { SelectArrows6Icon } from '@oxide/ui'

export type ListboxItem<Value extends string = string> = {
  value: Value
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

export interface ListboxProps<Value extends string = string> {
  selectedItem: Value | null
  items: ListboxItem<Value>[]
  placeholder?: string
  className?: string
  disabled?: boolean
  // null can only be the default value. onChange is never called with null
  onChange: (value: Value) => void
  // onBlur?: () => void
  hasError?: boolean
  name?: string
  label?: string
  description?: string
  helpText?: string
  required?: boolean
  isLoading?: boolean
}

export const Listbox = <Value extends string = string>({
  name,
  selectedItem,
  items,
  placeholder = 'Select an option',
  className,
  onChange,
  hasError = false,
  // onBlur,
  label,
  description,
  helpText,
  required,
  disabled,
  isLoading = false,
  ...props
}: ListboxProps<Value>) => {
  const { refs, floatingStyles } = useFloating({
    middleware: [
      offset(12),
      flip(),
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

  const item = selectedItem && getItem(selectedItem)
  const selectedLabel = item ? (item.labelString ? item.labelString : item.label) : null

  const noItems = !isLoading && items.length === 0
  const isDisabled = disabled || noItems

  return (
    <div className={cn('relative', className)}>
      <Select
        value={selectedItem}
        onChange={(val) => {
          // you shouldn't ever be able to select null, but we check here anyway
          // to make TS happy so the calling code doesn't have to. note `val !==
          // null` because '' is falsy but potentially a valid value
          if (val !== null) onChange(val)
        }}
        disabled={isDisabled}
      >
        {({ open }) => (
          <>
            {label && (
              <div className="mb-2">
                <FieldLabel id={``} as="div" tip={description} optional={!required}>
                  <Select.Label>{label}</Select.Label>
                </FieldLabel>
                {helpText && <TextInputHint id={``}>{helpText}</TextInputHint>}
              </div>
            )}
            <Select.Button
              name={name}
              ref={refs.setReference}
              className={cn(
                `flex h-10 w-full items-center justify-between
                    rounded border text-sans-md`,
                hasError
                  ? 'focus-error border-error-secondary hover:border-error'
                  : 'border-default hover:border-hover',
                open && 'ring-2 ring-accent-secondary',
                open && hasError && 'ring-error-secondary',
                isDisabled
                  ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
                  : 'bg-default'
              )}
              {...props}
            >
              <div className="w-full px-3 text-left">
                {selectedItem ? (
                  selectedLabel
                ) : (
                  <span className="text-quaternary">
                    {noItems ? 'No items' : placeholder}
                  </span>
                )}
              </div>
              {!isDisabled && <SpinnerLoader isLoading={isLoading} loadTime={500} />}
              <div
                className="ml-3 flex h-[calc(100%-12px)] items-center border-l px-3 border-secondary"
                aria-hidden
              >
                <SelectArrows6Icon title="Select" className="w-2 text-tertiary" />
              </div>
            </Select.Button>
            <FloatingPortal>
              <Select.Options
                ref={refs.setFloating}
                style={floatingStyles}
                className="ox-menu pointer-events-auto z-50 overflow-y-auto !outline-none"
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
