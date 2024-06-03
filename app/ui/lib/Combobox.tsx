/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Combobox as HCombobox,
  Label,
} from '@headlessui/react'
import cn from 'classnames'
import { useState, type ReactNode } from 'react'

import { SelectArrows6Icon } from '@oxide/design-system/icons/react'

import { FieldLabel } from './FieldLabel'
import { SpinnerLoader } from './Spinner'
import { TextInputHint } from './TextInput'

export type ComboboxItem<Value extends string = string> = {
  value: Value
} & { label?: string | ReactNode; selectedLabel?: string }

export interface ComboboxProps<Value extends string = string> {
  description?: React.ReactNode
  items: Array<{ label: string; value: string }>
  selected?: Value | null
  label?: React.ReactNode
  required?: boolean
  hasError?: boolean
  isDisabled?: boolean
  isLoading?: boolean
  onChange: (value: Value) => void
}

export const Combobox = ({
  description,
  items,
  selected,
  label,
  required,
  hasError = false,
  isDisabled,
  isLoading = false,
  onChange,
}: ComboboxProps) => {
  const [query, setQuery] = useState(selected || '')

  const filteredItems =
    query === ''
      ? items
      : items.filter((item) => {
          return (
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.value.toLowerCase().includes(query.toLowerCase())
          )
        })

  return (
    <>
      <HCombobox
        value={selected}
        onChange={(val) => val !== null && onChange(val)}
        onClose={() => setQuery('')}
        defaultValue={selected}
        disabled={isDisabled || isLoading}
      >
        {({ open }) => (
          <>
            {label && (
              <div className="mb-2">
                <FieldLabel
                  id={`label-for-${label.toLocaleString()}`}
                  as="div"
                  optional={!required}
                >
                  <Label>{label}</Label>
                </FieldLabel>
                {description && <TextInputHint id={``}>{description}</TextInputHint>}
              </div>
            )}

            <div className="flex rounded">
              <ComboboxInput
                aria-label="Assignee"
                displayValue={() => (selected ? selected : query)}
                onChange={(event) => setQuery(event.target.value)}
                className={`w-full rounded border-none
          px-3 py-[0.6875rem] !outline-offset-1
          text-sans-md text-default bg-default
          placeholder:text-quaternary focus:outline-none disabled:cursor-not-allowed disabled:text-tertiary disabled:bg-disabled`}
              />
              {!isDisabled && <SpinnerLoader isLoading={isLoading} />}
              <ComboboxButton>
                <div
                  //   className="flex h-[calc(100%-12px)] items-center border-l px-3 bg-default border-secondary"
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
                  aria-hidden
                >
                  <SelectArrows6Icon title="Select" className="w-2 text-tertiary" />
                </div>
              </ComboboxButton>
            </div>
            <ComboboxOptions
              anchor="bottom"
              className="DropdownMenuContent ox-menu pointer-events-auto relative z-sideModalDropdown overflow-y-auto border-b !outline-none border-secondary last:border-0 empty:hidden"
            >
              {filteredItems.map((item) => (
                <ComboboxOption
                  key={item.label}
                  value={item.label}
                  className={cn(
                    'DropdownMenuItem ox-menu-item relative border-b text-tertiary border-secondary last:border-0 active:text-accent-secondary selected:text-accent-secondary'
                  )}
                  onSelect={() => {
                    onChange(item.label)
                    setQuery(item.label)
                  }}
                >
                  {({ active, selected }) => (
                    // TODO: redo active styling with `data-active` somehow
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
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </>
        )}
      </HCombobox>
    </>
  )
}
