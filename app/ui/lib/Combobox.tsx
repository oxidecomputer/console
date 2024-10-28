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
} from '@headlessui/react'
import cn from 'classnames'
import { matchSorter } from 'match-sorter'
import { useId, useState, type ReactNode, type Ref } from 'react'

import { SelectArrows6Icon } from '@oxide/design-system/icons/react'

import { FieldLabel } from './FieldLabel'
import { usePopoverZIndex } from './SideModal'
import { TextInputHint } from './TextInput'

export type ComboboxItem = { value: string; label: ReactNode; selectedLabel: string }

/** Convert an array of items with a `name` attribute to an array of ComboboxItems
 *  Useful when the rendered label and value are the same; in more complex cases,
 *  you may want to create a custom ComboboxItem object (see toImageComboboxItem).
 */
export const toComboboxItems = (items?: Array<{ name: string }>): Array<ComboboxItem> =>
  items?.map(({ name }) => ({
    value: name,
    label: name,
    selectedLabel: name,
  })) || []

export const getSelectedLabelFromValue = (
  items: Array<ComboboxItem>,
  selectedValue: string
): string => items.find((item) => item.value === selectedValue)?.selectedLabel || ''

/** Simple non-generic props shared with ComboboxField */
export type ComboboxBaseProps = {
  description?: React.ReactNode
  disabled?: boolean
  isLoading?: boolean
  items: Array<ComboboxItem>
  label: string
  placeholder?: string
  required?: boolean
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
  selectedItemValue: string
  selectedItemLabel: string
  hasError?: boolean
  onChange: (value: string) => void
  /** Necessary if you want RHF to be able to focus it on error */
  inputRef?: Ref<HTMLInputElement>
} & ComboboxBaseProps

export const Combobox = ({
  description,
  items = [],
  label,
  selectedItemValue,
  selectedItemLabel,
  placeholder,
  required,
  hasError,
  disabled,
  isLoading,
  onChange,
  onInputChange,
  allowArbitraryValues = false,
  hideOptionalTag,
  inputRef,
  ...props
}: ComboboxProps) => {
  const [query, setQuery] = useState(selectedItemValue || '')
  const q = query.toLowerCase().replace(/\s*/g, '')
  const filteredItems = matchSorter(items, q, {
    keys: ['selectedLabel', 'label'],
    sorter: (items) => items, // preserve original order, don't sort by match
  })
  const zIndex = usePopoverZIndex()
  const id = useId()
  return (
    <>
      <HCombobox
        // necessary, as the displayed "value" is not the same as the actual selected item's *value*
        value={selectedItemValue}
        // fallback to '' allows clearing field to work
        onChange={(val) => onChange(val || '')}
        onClose={() => setQuery('')}
        disabled={disabled || isLoading}
        immediate
        {...props}
      >
        {label && (
          // TODO: FieldLabel needs a real ID
          <div className="mb-2">
            <FieldLabel
              id={`${id}-label`}
              htmlFor={`${id}-input`}
              optional={!required && !hideOptionalTag}
            >
              {label}
            </FieldLabel>
            {description && (
              <TextInputHint id={`${id}-help-text`}>{description}</TextInputHint>
            )}
          </div>
        )}
        <div
          className={cn(
            `flex rounded border focus-within:ring-2`,
            hasError
              ? 'focus-error border-error-secondary focus-within:ring-error-secondary hover:border-error'
              : 'border-default focus-within:ring-accent-secondary hover:border-hover',
            disabled
              ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
              : 'bg-default',
            disabled && hasError && '!border-error-secondary'
          )}
          // Putting the inputRef on the div makes it so the div can be focused by RHF when there's an error.
          // We want to focus on the div (rather than the input) so the combobox doesn't open automatically
          // and obscure the error message.
          ref={inputRef}
          // tabIndex=-1 is necessary to make the div focusable
          tabIndex={-1}
        >
          <ComboboxInput
            id={`${id}-input`}
            // displayValue controls what's displayed in the input field.
            // selectedItemValue is displayed when the user can type in a new value.
            // Otherwise, use the provided selectedItemLabel
            displayValue={() =>
              allowArbitraryValues ? selectedItemValue : selectedItemLabel
            }
            onChange={(event) => {
              // updates the query state as the user types, in order to filter the list of items
              setQuery(event.target.value)
              // if the parent component wants to know about input changes, call the callback
              onInputChange?.(event.target.value)
            }}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              `h-10 w-full rounded !border-none px-3 py-2 !outline-none text-sans-md text-default placeholder:text-quaternary`,
              disabled
                ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
                : 'bg-default',
              hasError && 'focus-error'
            )}
          />
          {items.length > 0 && (
            <ComboboxButton
              className="my-1.5 flex items-center border-l px-3 bg-default border-secondary"
              aria-hidden
            >
              <SelectArrows6Icon title="Select" className="w-2 text-tertiary" />
            </ComboboxButton>
          )}
        </div>
        {items.length > 0 && (
          <ComboboxOptions
            anchor="bottom start"
            // 12px gap is presumably because it's measured from inside the outline or something
            className={`ox-menu pointer-events-auto ${zIndex} relative w-[calc(var(--input-width)+var(--button-width))] overflow-y-auto border !outline-none border-secondary [--anchor-gap:12px] empty:hidden`}
            modal={false}
          >
            {!allowArbitraryValues && filteredItems.length === 0 && (
              <ComboboxOption disabled value="no-matches" className="relative">
                <div className="ox-menu-item !text-disabled">No items match</div>
              </ComboboxOption>
            )}
            {filteredItems.map((item) => (
              <ComboboxOption
                key={item.value}
                value={item.value}
                className="relative border-b border-secondary last:border-0"
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
