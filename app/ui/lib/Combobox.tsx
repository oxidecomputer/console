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

export type ComboboxItem = { label: string; value: string }

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

type ComboboxProps = {
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
        disabled={isDisabled || isLoading}
      >
        {label && (
          // TODO: FieldLabel needs a real ID
          <div className="mb-2">
            <FieldLabel id="FieldLabel" as="div" tip={tooltipText} optional={!required}>
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
          // 14px gap is presumably because it's measured from inside the outline or something
          className={`ox-menu pointer-events-auto ${zIndex} relative w-[var(--button-width)] overflow-y-auto border !outline-none border-secondary [--anchor-gap:14px] empty:hidden`}
          modal={false}
        >
          {filteredItems.length === 0 && (
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
      </HCombobox>
    </>
  )
}
