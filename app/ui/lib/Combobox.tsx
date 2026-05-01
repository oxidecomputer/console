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
import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from 'react'

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
  const [query, setQuery] = useState(
    allowArbitraryValues ? selectedItemValue || '' : selectedItemLabel || ''
  )
  // When the input's text matches the current selection (e.g., the user just
  // re-opened the dropdown without typing), show all items so they can pick a
  // different one. Only filter once the user has typed something different.
  // Arbitrary-values mode always filters by what's typed, since there's no
  // "selection vs. typing" distinction there.
  const userIsFiltering = allowArbitraryValues || query !== (selectedItemLabel || '')
  const q = query.toLowerCase().replace(/\s*/g, '')
  const filteredItems = userIsFiltering
    ? matchSorter(items, q, {
        keys: ['selectedLabel', 'label'],
        sorter: (items) => items, // preserve original order, don't sort by match
      })
    : items.slice()

  // Keep the input's typing buffer (`query`) in sync with the selection coming
  // from props.
  //
  // - allowArbitraryValues=true: clear the buffer whenever the value clears
  //   (e.g., firewall rules subform reset). Typing already updates the value
  //   directly via onInputChange, so we don't need to mirror non-empty values
  //   here.
  // - allowArbitraryValues=false: snap the buffer to the selected label
  //   whenever it changes. Typing is transient — it filters the dropdown but
  //   doesn't change the selection — so the displayed text needs an outside
  //   nudge to follow the selected value.
  useEffect(() => {
    if (allowArbitraryValues) {
      if (!selectedItemValue) setQuery('')
    } else {
      setQuery(selectedItemLabel || '')
    }
  }, [allowArbitraryValues, selectedItemValue, selectedItemLabel])

  // If the user has typed in a value that isn't in the list,
  // add it as an option if `allowArbitraryValues` is true
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
  const zIndex = usePopoverZIndex()
  const id = useId()
  // Tracks whether the dropdown is open so the onKeyDown handler can
  // distinguish Enter-to-select (dropdown open, let HUI handle it) from
  // Enter-to-submit (dropdown closed, fire onEnter). We use a ref instead
  // of HUI's `open` render prop because our handler runs before HUI's
  // (useRender merges user props first) and the render prop can be stale.
  // The ref stays current because onClose sets it synchronously during
  // HUI's own keydown handler. With the stale render prop, the handler
  // could see the combobox as closed one keydown too late, firing onEnter
  // instead of letting HUI select — hard to notice manually but caused
  // consistent e2e flakes in Firefox.
  const isOpenRef = useRef(false)
  return (
    <HCombobox
      // necessary, as the displayed "value" is not the same as the actual selected item's *value*
      value={selectedItemValue}
      // fallback to '' allows clearing field to work
      onChange={(val) => onChange(val || '')}
      onClose={() => {
        isOpenRef.current = false
        // Revert any in-progress typing back to the selected label so the
        // input reflects the committed selection on blur. (The arbitrary
        // case keeps whatever the user typed, since typing IS the value.)
        if (!allowArbitraryValues) setQuery(selectedItemLabel || '')
      }}
      disabled={disabled || isLoading}
      immediate
      {...props}
    >
      {({ open }) => {
        // Sync open state to ref on render (handles the opening side)
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
              // Putting the inputRef on the div makes it so the div can be focused by RHF when there's an error.
              // We want to focus on the div (rather than the input) so the combobox doesn't open automatically
              // and obscure the error message.
              ref={inputRef}
              // tabIndex=-1 is necessary to make the div focusable
              tabIndex={-1}
            >
              <ComboboxInput
                id={`${id}-input`}
                // We use value here (instead of Headless UI's displayValue) so we
                // can normalize input via the onChange event. For arbitrary
                // values, the selected value IS what's displayed, so it takes
                // precedence over the typing buffer. For non-arbitrary values,
                // the typing buffer is authoritative — the useEffect above keeps
                // it in sync with the selected label, and onClose snaps it back
                // on blur — so typing/backspace visibly edits the field while
                // the dropdown filters in lockstep.
                value={allowArbitraryValues ? selectedItemValue || query : query}
                onChange={(event) => {
                  const value = transform
                    ? transform(event.target.value)
                    : event.target.value
                  // updates the query state as the user types, in order to filter the list of items
                  setQuery(value)
                  // if the parent component wants to know about input changes, call the callback
                  onInputChange?.(value)
                }}
                onKeyDown={(e) => {
                  // When the dropdown is open, Enter should select the
                  // highlighted option (HUI handles this). When closed,
                  // Enter should submit the subform via onEnter.
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
                // 13px gap is presumably because it's measured from inside the outline or something
                className={`ox-menu shadow-menu-inset pointer-events-auto ${zIndex} border-secondary relative w-[calc(var(--input-width)+var(--button-width))] overflow-y-auto border [--anchor-gap:13px] empty:hidden`}
                modal={false}
              >
                {filteredItems.map((item) => (
                  <ComboboxOption
                    key={item.value}
                    value={item.value}
                    className="border-secondary relative border-b last:border-0"
                  >
                    {({ focus, selected }) => (
                      // This *could* be done with data-[focus] and data-[selected] instead, but
                      // it would be a lot more verbose. those can only be used with TW classes,
                      // not our .is-selected and .is-highlighted, so we'd have to copy the pieces
                      // of those rules one by one. Better to rely on the shared classes.
                      <div
                        className={cn('ox-menu-item', {
                          'is-selected': selected && query !== item.value,
                          'is-highlighted': focus,
                        })}
                      >
                        {item.label}
                      </div>
                    )}
                  </ComboboxOption>
                ))}
                {!allowArbitraryValues && filteredItems.length === 0 && (
                  <ComboboxOption disabled value="no-matches" className="relative">
                    <div className="ox-menu-item text-disabled!">No items match</div>
                  </ComboboxOption>
                )}
              </ComboboxOptions>
            )}
          </div>
        )
      }}
    </HCombobox>
  )
}
