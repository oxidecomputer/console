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
import { matchSorter } from 'match-sorter'
import { useState } from 'react'

import { SelectArrows6Icon } from '@oxide/design-system/icons/react'

import { FieldLabel } from './FieldLabel'
import { usePopoverZIndex } from './SideModal'
import { TextInputHint } from './TextInput'

/** Simple non-generic props shared with ComboboxField */
export type ComboboxBaseProps = {
  description?: React.ReactNode
  disabled?: boolean
  isLoading?: boolean
  items: Array<{ label: string; value: string }>
  label: string
  placeholder?: string
  required?: boolean
  ariaLabel?: string
  hideOptionalTag?: boolean
  /**
   * Pass in `allowArbitraryValues` as `true` when the user should be able to
   * type in new values that aren't in the list [default is `false`]
   */
  allowArbitraryValues?: boolean
  /**
   * Pass in `onInputChange` when an event should be triggered when the user types in the field;
   * This is distinct from `onChange` which is triggered when the user selects an item from the list.
   * For example, if a form value should be set when the user types, use `onInputChange`.
   */
  onInputChange?: (value: string) => void
}

type ComboboxProps = {
  selected: string | null
  hasError?: boolean
  onChange: (value: string) => void
} & ComboboxBaseProps

export const Combobox = ({
  description,
  items = [],
  selected,
  label,
  placeholder,
  required,
  hasError,
  disabled,
  isLoading,
  onChange,
  onInputChange,
  allowArbitraryValues = false,
  ariaLabel,
  hideOptionalTag,
}: ComboboxProps) => {
  const [query, setQuery] = useState(selected || '')

  const q = query.toLowerCase()
  const filteredItems = matchSorter(items, q, {
    keys: ['value'],
    sorter: (items) => items, // preserve original order, don't sort by match
  })

  const zIndex = usePopoverZIndex()

  return (
    <>
      <HCombobox
        value={selected}
        // fallback to '' allows clearing field to work
        onChange={(val) => onChange(val || '')}
        onClose={() => setQuery('')}
        defaultValue={selected}
        disabled={disabled || isLoading}
      >
        {label && (
          // TODO: FieldLabel needs a real ID
          <div className="mb-2">
            <FieldLabel id="FieldLabel" as="div" optional={!required && !hideOptionalTag}>
              <Label>{label}</Label>
            </FieldLabel>
            {description && <TextInputHint id="TextInputHint">{description}</TextInputHint>}
          </div>
        )}
        <ComboboxButton
          className={cn(
            `flex h-10 w-full grow items-center justify-between rounded border text-sans-md ring-accent-secondary data-[open]:ring-2`,
            hasError
              ? 'focus-error border-error-secondary hover:border-error'
              : 'border-default hover:border-hover',
            hasError && 'data-[open]:ring-error-secondary',
            disabled
              ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
              : 'bg-default',
            disabled && hasError && '!border-error-secondary'
          )}
        >
          <ComboboxInput
            aria-label={ariaLabel}
            displayValue={() => (selected ? selected : query)}
            onChange={(event) => {
              setQuery(event.target.value)
              onInputChange?.(event.target.value)
            }}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              `w-full rounded !border-none px-3 py-[0.5rem] !outline-none text-sans-md text-default placeholder:text-quaternary`,
              disabled
                ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
                : 'bg-default',
              hasError && 'focus-error'
            )}
          />
          {items.length > 0 && (
            <div className="flex items-center border-l px-3 border-secondary" aria-hidden>
              <SelectArrows6Icon title="Select" className="w-2 text-tertiary" />
            </div>
          )}
        </ComboboxButton>
        {items.length > 0 && (
          <ComboboxOptions
            anchor="bottom start"
            // 14px gap is presumably because it's measured from inside the outline or something
            className={`ox-menu pointer-events-auto ${zIndex} relative w-[var(--button-width)] overflow-y-auto border !outline-none border-secondary [--anchor-gap:14px] empty:hidden`}
            modal={false}
          >
            {!allowArbitraryValues && filteredItems.length === 0 && (
              <ComboboxOption disabled value="no-matches" className="relative">
                <div className="ox-menu-item !text-disabled">No items match</div>
              </ComboboxOption>
            )}
            {filteredItems.map((item) => (
              <ComboboxOption
                key={item.label}
                value={item.label}
                className="relative border-b border-secondary last:border-0"
                onSelect={() => {
                  onChange(item.label)
                  setQuery(item.label)
                }}
              >
                {({ focus, selected }) => (
                  // This *could* be done with data-[focus] and data-[selected] instead, but
                  // it would be a lot more verbose. those can only be used with TW classes,
                  // not our .is-selected and .is-highlighted, so we'd have to copy the pieces
                  // of those rules one by one. Better to rely on the shared classes.
                  <div
                    className={cn('ox-menu-item', {
                      'is-selected': selected,
                      'is-highlighted': focus,
                    })}
                  >
                    {item.label}
                  </div>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </HCombobox>
    </>
  )
}
