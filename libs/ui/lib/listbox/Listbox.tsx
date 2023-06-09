import { FloatingPortal, size, useFloating } from '@floating-ui/react'
import { Listbox as Select } from '@headlessui/react'
import cn from 'classnames'
import type { ReactElement } from 'react'
import { useState } from 'react'

import { FieldLabel, TextInputHint } from '@oxide/ui'
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
  // onBlur?: () => void
  hasError?: boolean
  name?: string
  label?: string
  description?: string
  helpText?: string
  required?: boolean
}

export const Listbox = ({
  name,
  defaultValue,
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
                props.disabled
                  ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
                  : 'bg-default'
              )}
              {...props}
            >
              <div className="px-3">
                {selected ? (
                  selectedLabel
                ) : (
                  <span className="text-quaternary">{placeholder}</span>
                )}
              </div>
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
