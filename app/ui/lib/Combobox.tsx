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
import { useState } from 'react'

import { SelectArrows6Icon } from '@oxide/design-system/icons/react'

import { FieldLabel } from './FieldLabel'
import { TextInputHint } from './TextInput'

type ComboboxItem = { label: string; value: string }

/** Simple non-generic props shared with ComboboxField */
export type ComboboxBaseProps = {
  description?: React.ReactNode
  isDisabled?: boolean
  isLoading?: boolean
  items: ComboboxItem[]
  label: string
  placeholder?: string
  required?: boolean
  tooltipText?: string
}
export type ComboboxProps = {
  selected: string | null
  hasError?: boolean
  onChange: (value: string) => void
} & ComboboxBaseProps

export const Combobox = ({
  description,
  items,
  selected,
  label,
  placeholder,
  tooltipText,
  required,
  hasError,
  isDisabled,
  isLoading,
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
                <FieldLabel id="FieldLabel" as="div" tip={tooltipText} optional={!required}>
                  <Label>{label}</Label>
                </FieldLabel>
                {description && (
                  <TextInputHint id="TextInputHint">{description}</TextInputHint>
                )}
              </div>
            )}
            <ComboboxButton
              className={cn(
                `flex h-10 w-full grow items-center justify-between rounded border text-sans-md`,
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
            >
              <ComboboxInput
                aria-label="Select a disk"
                displayValue={() => (selected ? selected : query)}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                disabled={isDisabled || isLoading}
                className={cn(
                  `w-full rounded !border-none px-3 py-[0.5rem] !outline-none text-sans-md text-default placeholder:text-quaternary`,
                  isDisabled
                    ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
                    : 'bg-default',
                  hasError && 'focus-error'
                )}
              />
              <div className="flex items-center border-l px-3 border-secondary" aria-hidden>
                <SelectArrows6Icon title="Select" className="w-2 text-tertiary" />
              </div>
            </ComboboxButton>
            <ComboboxOptions
              anchor="bottom start"
              className="DropdownMenuContent ox-menu pointer-events-auto relative z-sideModalDropdown w-[var(--button-width)] overflow-y-auto border border-b !outline-none border-secondary [--anchor-gap:8px] last:border-0 empty:hidden"
            >
              {filteredItems.length === 0 && (
                <ComboboxOption
                  disabled
                  value="no-matches"
                  className="relative border border-secondary"
                >
                  <div className="ox-menu-item !text-disabled">no items match</div>
                </ComboboxOption>
              )}
              {filteredItems.map((item) => (
                <ComboboxOption
                  key={item.label}
                  value={item.label}
                  className="relative border text-tertiary border-secondary active:text-accent-secondary selected:text-accent-secondary"
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
