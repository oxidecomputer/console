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
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react'

import { SelectArrows6Icon } from '@oxide/design-system/icons/react'

import { FieldLabel } from './FieldLabel'
import { usePopoverZIndex } from './SideModal'
import { TextInputHint } from './TextInput'

export type ComboboxItem = { value: string; label: ReactNode; selectedLabel: string }

// HUI's virtual render prop only accepts one child, so we surface "No items
// match" via a disabled sentinel option instead of a sibling element.
const NO_MATCH_VALUE = '__combobox_no_match__'
const NO_MATCH_ITEM: ComboboxItem = {
  value: NO_MATCH_VALUE,
  label: 'No items match',
  selectedLabel: '',
}
// HUI types `disabled` with the same union as `value`, so item may be null
const isNoMatch = (item: ComboboxItem | null) => item?.value === NO_MATCH_VALUE

// HUI's virtualizer needs the scroll container to have a non-zero height
// before it'll render any items, but it renders no items until the
// container has a height. Setting an explicit height breaks the cycle.
// 40 matches HUI's internal estimateSize default.
const ITEM_HEIGHT = 40
const MAX_PANEL_HEIGHT = 280

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
  /** Fires whenever the Enter key is pressed while Combobox input has focus */
  onEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  /**
   * Optional function to transform the value entered into the input as the user types.
   */
  transform?: (value: string) => string
}

type ComboboxProps = {
  selectedItemValue: string
  hasError?: boolean
  /** Fires when the user *selects* an item from the list */
  onChange: (value: string) => void
  /** Necessary if you want RHF to be able to focus it on error */
  inputRef?: Ref<HTMLInputElement>
} & ComboboxBaseProps

export const Combobox = ({
  description,
  items = [],
  label,
  selectedItemValue,
  placeholder,
  required,
  hasError,
  disabled,
  isLoading,
  onChange,
  onEnter,
  onInputChange,
  allowArbitraryValues = false,
  hideOptionalTag,
  inputRef,
  transform,
}: ComboboxProps) => {
  const [query, setQuery] = useState(selectedItemValue || '')
  const q = query.toLowerCase().replace(/\s+/g, '')
  const filteredItems = matchSorter(items, q, {
    keys: ['selectedLabel', 'label'],
    sorter: (items) => items, // preserve original order, don't sort by match
  })

  // Clear the query when the parent clears the value (e.g. firewall rules
  // form on subform submit). Only needed for allowArbitraryValues; without
  // it, parent-driven clears leave the input still showing the old query.
  useEffect(() => {
    if (allowArbitraryValues && !selectedItemValue) {
      setQuery('')
    }
  }, [allowArbitraryValues, selectedItemValue])

  if (
    allowArbitraryValues &&
    query.length > 0 &&
    !filteredItems.some((i) => i.selectedLabel === query)
  ) {
    filteredItems.push({
      value: query,
      label: (
        <>
          <span className="text-default">Custom:</span> {query}
        </>
      ),
      selectedLabel: query,
    })
  }
  const virtualOptions: ComboboxItem[] =
    filteredItems.length === 0 && !allowArbitraryValues ? [NO_MATCH_ITEM] : filteredItems

  // Arbitrary values may not be in `items`, so synthesize a stand-in.
  const selectedItem = useMemo<ComboboxItem | null>(() => {
    if (!selectedItemValue) return null
    const found = items.find((i) => i.value === selectedItemValue)
    if (found) return found
    if (allowArbitraryValues) {
      return {
        value: selectedItemValue,
        label: selectedItemValue,
        selectedLabel: selectedItemValue,
      }
    }
    return null
  }, [items, selectedItemValue, allowArbitraryValues])

  const zIndex = usePopoverZIndex()
  const id = useId()
  // Lets onKeyDown distinguish Enter-to-select (open) from Enter-to-submit
  // (closed). HUI's `open` render prop is stale by one keydown in our
  // handler ordering — caused Firefox e2e flakes.
  const isOpenRef = useRef(false)
  return (
    <HCombobox
      // items are re-created each render, so compare by value field
      by="value"
      value={selectedItem}
      onChange={(item) => {
        if (!item || item.value === NO_MATCH_VALUE) {
          onChange('')
          return
        }
        onChange(item.value)
      }}
      onClose={() => {
        isOpenRef.current = false
        if (!allowArbitraryValues) setQuery('')
      }}
      disabled={disabled || isLoading}
      immediate
      virtual={{ options: virtualOptions, disabled: isNoMatch }}
    >
      {({ open }) => {
        if (open) isOpenRef.current = true
        return (
          <div>
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
                `bg-default flex rounded-md border focus-within:ring-2`,
                hasError
                  ? 'focus-error border-error-secondary focus-within:ring-error-secondary hover:border-error'
                  : 'border-default focus-within:ring-accent-secondary hover:border-raise',
                disabled
                  ? 'text-disabled bg-disabled border-default! cursor-not-allowed'
                  : 'bg-default',
                disabled && hasError && 'border-error-secondary!'
              )}
              // ref on the wrapper, not the input, so RHF can focus on
              // error without opening the dropdown and hiding the message
              ref={inputRef}
              tabIndex={-1}
            >
              <ComboboxInput
                id={`${id}-input`}
                // Bypass HUI's displayValue so `transform` can normalize what
                // the user types via onChange
                value={
                  selectedItemValue
                    ? allowArbitraryValues
                      ? selectedItemValue
                      : (selectedItem?.selectedLabel ?? '')
                    : query
                }
                onChange={(event) => {
                  const value = transform
                    ? transform(event.target.value)
                    : event.target.value
                  setQuery(value)
                  onInputChange?.(value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isOpenRef.current) {
                    e.preventDefault()
                    onEnter?.(e)
                  }
                }}
                placeholder={placeholder}
                disabled={disabled || isLoading}
                className={cn(
                  `text-sans-md text-raise placeholder:text-tertiary h-10 w-full rounded-md border-none! px-3 py-2 outline-hidden!`,
                  disabled
                    ? 'text-disabled bg-disabled border-default! cursor-not-allowed'
                    : 'bg-default',
                  hasError && 'focus-error'
                )}
              />
              {items.length > 0 && (
                <ComboboxButton
                  className={cn(
                    'relative flex items-center px-3 before:absolute before:inset-y-1.5 before:left-0 before:w-px before:content-[""] before:bg-(--stroke-secondary)',
                    disabled ? 'bg-disabled cursor-not-allowed' : 'bg-default'
                  )}
                  aria-hidden
                >
                  <SelectArrows6Icon title="Select" className="text-secondary w-2" />
                </ComboboxButton>
              )}
            </div>
            {(items.length > 0 || allowArbitraryValues) && (
              <ComboboxOptions
                anchor="bottom start"
                className={`ox-menu shadow-menu-inset pointer-events-auto ${zIndex} border-secondary relative w-[calc(var(--input-width)+var(--button-width))] overflow-y-auto border [--anchor-gap:13px]`}
                style={{
                  height: Math.min(virtualOptions.length * ITEM_HEIGHT, MAX_PANEL_HEIGHT),
                }}
                modal={false}
              >
                {({ option }: { option: ComboboxItem }) => {
                  const noMatch = option.value === NO_MATCH_VALUE
                  return (
                    <ComboboxOption
                      value={option}
                      disabled={noMatch}
                      // w-full: HUI's virtualizer absolutely-positions each
                      // option, so without an explicit width they collapse
                      // to content width.
                      className="border-secondary relative w-full border-b last:border-0"
                    >
                      {({ focus, selected }) => (
                        <div
                          className={cn('ox-menu-item', {
                            'is-selected': selected && query !== option.value && !noMatch,
                            'is-highlighted': focus && !noMatch,
                            'text-disabled!': noMatch,
                          })}
                        >
                          {option.label}
                        </div>
                      )}
                    </ComboboxOption>
                  )
                }}
              </ComboboxOptions>
            )}
          </div>
        )
      }}
    </HCombobox>
  )
}
