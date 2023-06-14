import { FloatingPortal, flip, offset, size, useFloating } from '@floating-ui/react'
import { Listbox as Select } from '@headlessui/react'
import cn from 'classnames'
import type { ReactNode } from 'react'

import { FieldLabel, SpinnerLoader, TextInputHint } from '@oxide/ui'
import { SelectArrows6Icon } from '@oxide/ui'

export type ListboxItem<Value extends string = string> = {
  value: Value
} & (
  | { label: string; labelString?: never }
  // labelString is required when `label` is a `ReactElement` because we
  // need need a one-line string to display in the button when the item is
  // selected.
  | { label: ReactNode; labelString: string }
)

export interface ListboxProps<Value extends string = string> {
  // null is allowed as a default empty value, but onChange will never be called with null
  selected: Value | null
  onChange: (value: Value) => void
  items: ListboxItem<Value>[]
  placeholder?: string
  className?: string
  disabled?: boolean
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
  selected,
  items,
  placeholder = 'Select an option',
  className,
  onChange,
  hasError = false,
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

  const selectedItem = selected && items.find((i) => i.value === selected)
  const noItems = !isLoading && items.length === 0
  const isDisabled = disabled || noItems

  return (
    <div className={cn('relative', className)}>
      <Select
        value={selected}
        // you shouldn't ever be able to select null, but we check here anyway
        // to make TS happy so the calling code doesn't have to. note `val !==
        // null` because '' is falsy but potentially a valid value
        onChange={(val) => val !== null && onChange(val)}
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
                  : 'bg-default',
                isDisabled && hasError && '!border-error-secondary'
              )}
              {...props}
            >
              <div className="w-full px-3 text-left">
                {selectedItem ? (
                  // labelString is one line, which is what we need when label is a ReactNode
                  selectedItem.labelString || selectedItem.label
                ) : (
                  <span className="text-quaternary">
                    {noItems ? 'No items' : placeholder}
                  </span>
                )}
              </div>
              {!isDisabled && <SpinnerLoader isLoading={isLoading} />}
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
