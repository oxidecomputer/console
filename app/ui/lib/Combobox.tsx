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
import { matchSorter } from 'match-sorter'
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
  type Ref,
} from 'react'
import { useDebounce } from 'use-debounce'

import { SelectArrows6Icon } from '@oxide/design-system/icons/react'

import { FieldLabel } from './FieldLabel'
import { usePopoverZIndex } from './SideModal'
import { TextInputHint } from './TextInput'

export type ComboboxItem = { value: string; label: ReactNode; selectedLabel: string }

// Memoized component for individual options - only re-renders when focus/selected actually changes for THIS item
const MemoizedComboboxOptionContent = memo(function ComboboxOptionContent({
  item,
  focus,
  selected,
}: {
  item: ComboboxItem
  focus: boolean
  selected: boolean
}) {
  return (
    <div className="ox-menu-item" data-selected={selected} data-highlighted={focus}>
      {item.label}
    </div>
  )
})

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

// Create a cached lookup map for O(1) selectedLabel lookups
const labelLookupCache = new WeakMap<Array<ComboboxItem>, Map<string, string>>()

export const getSelectedLabelFromValue = (
  items: Array<ComboboxItem>,
  selectedValue: string
): string => {
  if (!labelLookupCache.has(items)) {
    // Create lookup map for this items array
    const lookupMap = new Map<string, string>()
    items.forEach((item) => lookupMap.set(item.value, item.selectedLabel))
    labelLookupCache.set(items, lookupMap)
  }

  const lookupMap = labelLookupCache.get(items)!
  return lookupMap.get(selectedValue) || ''
}

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
  selectedItemLabel: string
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
  selectedItemLabel,
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
  ...props
}: ComboboxProps) => {
  const [query, setQuery] = useState(() =>
    selectedItemValue ? (allowArbitraryValues ? selectedItemValue : selectedItemLabel) : ''
  )

  // Debounce the query for filtering to reduce expensive operations while typing
  const [debouncedQuery] = useDebounce(query, 150)

  // Memoize query processing to avoid recalculation on every render
  const normalizedQuery = useMemo(
    () => debouncedQuery.toLowerCase().replace(/\s*/g, ''),
    [debouncedQuery]
  )

  // Memoize filtered items to avoid re-filtering on every render
  const filteredItems = useMemo(() => {
    return matchSorter(items, normalizedQuery, {
      keys: ['selectedLabel', 'label'],
      sorter: (items) => items, // preserve original order, don't sort by match
    })
  }, [items, normalizedQuery])

  // Memoize custom arbitrary value label to avoid recreation on every render
  // Use immediate query (not debounced) so custom option appears immediately
  const customValueItem = useMemo(() => {
    if (
      !allowArbitraryValues ||
      query.length === 0 ||
      filteredItems.some((i) => i.selectedLabel === query)
    ) {
      return null
    }
    return {
      value: query,
      label: (
        <>
          <span className="text-default">Custom:</span> {query}
        </>
      ),
      selectedLabel: query,
    }
  }, [allowArbitraryValues, query, filteredItems])

  // Final items list with custom value if applicable
  const finalFilteredItems = useMemo(() => {
    const itemsWithCustomValue = customValueItem
      ? [...filteredItems, customValueItem]
      : filteredItems
    return itemsWithCustomValue
  }, [filteredItems, customValueItem])

  // In the arbitraryValues case, clear the query whenever the value is cleared.
  // this is necessary, e.g., for the firewall rules form when you submit the
  // targets subform and clear the field. Two possible changes we might want to make
  // here if we run into issues:
  //
  //   1. do it all the time, not just in the arbitraryValues case
  //   2. do it on all value changes, not just on clear
  //
  // Currently, I don't think there are any arbitraryValues=false cases where we
  // set the value from outside. There is an arbitraryvalues=true case where we
  // setValue to something other than empty string, but we don't need the
  // sync because that setValue is done in onInputChange and we already are
  // doing setQuery in here along with it.
  useEffect(() => {
    if (allowArbitraryValues && !selectedItemValue) {
      setQuery('')
    }
  }, [allowArbitraryValues, selectedItemValue])

  // Memoize callbacks to prevent unnecessary re-renders; fallback to '' allows clearing field to work
  const handleChange = useCallback((val: string | null) => onChange(val || ''), [onChange])
  const handleClose = useCallback(() => setQuery(''), [])
  // We only want to keep the query on close when arbitrary values are allowed
  const onCloseHandler = allowArbitraryValues ? undefined : handleClose

  // Memoize input onChange callback to prevent function recreation on every render
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = transform ? transform(event.target.value) : event.target.value
      // updates the query state as the user types, in order to filter the list of items
      setQuery(value)
      // if the parent component wants to know about input changes, call the callback
      onInputChange?.(value)
    },
    [transform, onInputChange]
  )

  // Memoize onKeyDown callback to prevent function recreation on every render
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, open: boolean) => {
      // If the caller is using onEnter to override enter behavior, preventDefault
      // in order to prevent the containing form from being submitted too. We don't
      // need to do this when the combobox is open because that enter keypress is
      // already handled internally (selects the highlighted item). So we only do
      // this when the combobox is closed.
      if (e.key === 'Enter' && onEnter && !open) {
        e.preventDefault()
        onEnter(e)
      }
    },
    [onEnter]
  )

  const zIndex = usePopoverZIndex()
  const id = useId()

  const containerClassName = useMemo(
    () =>
      `flex rounded border focus-within:ring-2 ${
        hasError
          ? 'focus-error border-error-secondary focus-within:ring-error-secondary hover:border-error'
          : 'border-default focus-within:ring-accent-secondary hover:border-hover'
      } ${
        disabled
          ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
          : 'bg-default'
      } ${disabled && hasError ? '!border-error-secondary' : ''}`,
    [hasError, disabled]
  )

  const inputClassName = useMemo(
    () =>
      `h-10 w-full rounded !border-none px-3 py-2 !outline-none text-sans-md text-raise placeholder:text-tertiary ${disabled ? 'cursor-not-allowed text-disabled bg-disabled !border-default' : 'bg-default'} ${hasError ? 'focus-error' : ''}`,
    [hasError, disabled]
  )

  const buttonClassName = useMemo(
    () =>
      `my-1.5 flex items-center border-l px-3 border-secondary ${disabled ? 'cursor-not-allowed bg-disabled' : 'bg-default'}`,
    [disabled]
  )

  // 13px gap is presumably because it's measured from inside the outline or something
  const optionsClassName = useMemo(
    () =>
      `ox-menu pointer-events-auto ${zIndex} relative w-[calc(var(--input-width)+var(--button-width))] overflow-y-auto border !outline-none border-secondary [--anchor-gap:13px] empty:hidden`,
    [zIndex]
  )

  // Memoize input value computation to avoid recalculation on every render
  // If an option has been selected, display either the selected item's label or value.
  // If no option has been selected yet, or the user has started editing the input, display the query.
  // We are using value here, as opposed to Headless UI's displayValue, so we can normalize the value entered into the input (via the onChange event).
  const inputValue = useMemo(() => {
    return selectedItemValue
      ? allowArbitraryValues
        ? selectedItemValue
        : selectedItemLabel || ''
      : query || ''
  }, [selectedItemValue, allowArbitraryValues, selectedItemLabel, query])

  return (
    <HCombobox
      // necessary, as the displayed "value" is not the same as the actual selected item's *value*
      value={selectedItemValue || ''}
      onChange={handleChange}
      onClose={onCloseHandler}
      disabled={disabled || isLoading}
      immediate
      // Virtual scrolling requires string[] for options, but we have complex objects
      // The current performance optimizations (memoization, callbacks, CSS) should handle 1000+ items well
      {...props}
    >
      {({ open }) => (
        <div>
          {label && (
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
            className={containerClassName}
            // Putting the inputRef on the div makes it so the div can be focused by RHF when there's an error.
            // We want to focus on the div (rather than the input) so the combobox doesn't open automatically
            // and obscure the error message.
            ref={inputRef}
            // tabIndex=-1 is necessary to make the div focusable
            tabIndex={-1}
          >
            <ComboboxInput
              id={`${id}-input`}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, open)}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={inputClassName}
            />
            {items.length > 0 && (
              <ComboboxButton className={buttonClassName} aria-hidden>
                <SelectArrows6Icon title="Select" className="w-2 text-secondary" />
              </ComboboxButton>
            )}
          </div>
          {(items.length > 0 || allowArbitraryValues) && (
            <ComboboxOptions
              anchor="bottom start"
              className={optionsClassName}
              modal={false}
            >
              {finalFilteredItems.map((item) => (
                <ComboboxOption
                  key={item.value}
                  value={item.value}
                  className="relative border-b border-secondary last:border-0"
                >
                  {({ focus, selected }) => (
                    <MemoizedComboboxOptionContent
                      item={item}
                      focus={focus}
                      selected={selected}
                    />
                  )}
                </ComboboxOption>
              ))}
              {!allowArbitraryValues && finalFilteredItems.length === 0 && (
                <ComboboxOption disabled value="no-matches" className="relative">
                  <div className="ox-menu-item !text-disabled">No items match</div>
                </ComboboxOption>
              )}
            </ComboboxOptions>
          )}
        </div>
      )}
    </HCombobox>
  )
}
