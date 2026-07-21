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
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react'
import { mergeRefs } from 'react-merge-refs'

import { SelectArrows6Icon } from '@oxide/design-system/icons/react'

import { FieldLabel } from './FieldLabel'
import { usePopoverZIndex } from './SideModal'
import { TextInputHint } from './TextInput'

export type ComboboxItem = { value: string; label: ReactNode; selectedLabel: string }

// use a pseudo sentinel option when 0 matches, to play nice with Headless UI's virtualization
const NO_MATCH_ITEM: ComboboxItem = {
  value: '__combobox_no_match__',
  label: 'No items match',
  selectedLabel: '',
}
const isNoMatch = (item: ComboboxItem | null) => item === NO_MATCH_ITEM

// HUI's virtualizer needs the scroll container to have a non-zero height to
// render into, so we seed `minHeight` with a rough estimate. This must be a
// *lower bound* on the real rendered row height (.ox-menu-item: text-sans-md +
// py-2 + 1px border ≈ 35px): the panel is `overflow-y-auto`, so once the rows
// render it grows to fit their measured total. If the estimate overshoots the
// real content, the excess shows as empty space at the bottom of the panel.
const ITEM_HEIGHT = 34
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
  /** Necessary if you want RHF to be able to focus it on error. Goes on the
   * input's wrapper div (see usage), so it's a div ref despite the name. */
  inputRef?: Ref<HTMLDivElement>
} & ComboboxBaseProps

export const Combobox = ({
  description,
  items,
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
  const [query, setQuery] = useState('')
  // True between the first keystroke and the dropdown closing or a new
  // selection being made. While editing, the input shows `query` instead of
  // the selected item's label, so the user can see what they're typing.
  const [isEditing, setIsEditing] = useState(false)
  const q = query.toLowerCase().replace(/\s+/g, '')
  const filteredItems = matchSorter(items, q, {
    keys: ['selectedLabel'],
    sorter: (items) => items, // preserve original order, don't sort by match
  })

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

  const virtualOptions: ComboboxItem[] =
    filteredItems.length === 0 && !allowArbitraryValues ? [NO_MATCH_ITEM] : filteredItems
  const minHeight = Math.min(virtualOptions.length * ITEM_HEIGHT, MAX_PANEL_HEIGHT)

  // Arbitrary values may not be in `items`, so synthesize a stand-in.
  const selectedItem: ComboboxItem | null = (() => {
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
  })()

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

  // HUI measures `--input-width`/`--button-width` a frame after the panel's
  // first render, so with `immediate` the panel paints once at ~0 width, wrapping
  // rows and ballooning tall before snapping to size. Measure the always-mounted
  // input wrapper as a min-width floor so the correct width applies on frame one.
  // See https://github.com/tailwindlabs/headlessui/issues/3834
  const [panelWidth, setPanelWidth] = useState<number>()
  const measureRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setPanelWidth(el.clientWidth)
  }, [])

  return (
    <HCombobox
      // items are re-created each render, so compare by value field
      by="value"
      value={selectedItem}
      // fallback to '' allows clearing field to work
      onChange={(item) => {
        setIsEditing(false)
        onChange(item?.value ?? '')
      }}
      onClose={() => {
        isOpenRef.current = false
        setIsEditing(false)
        if (!allowArbitraryValues) setQuery('')
      }}
      disabled={disabled || isLoading}
      immediate
      virtual={{ options: virtualOptions, disabled: isNoMatch }}
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
              // and obscure the error message. measureRef reads its width to size the options panel (see above).
              ref={mergeRefs([inputRef, measureRef])}
              // tabIndex=-1 is necessary to make the div focusable
              tabIndex={-1}
            >
              <ComboboxInput
                id={`${id}-input`}
                // While the user is editing, show the query so they can see what they
                // typed. Otherwise, show the selected item's display value (or the query
                // if nothing is selected yet). On blur the dropdown closes, isEditing
                // flips to false, and the input reverts to the selection — preserving it.
                // We use `value` instead of HUI's `displayValue` so the input value can
                // be normalized via the onChange event.
                value={
                  isEditing
                    ? query
                    : selectedItemValue
                      ? allowArbitraryValues
                        ? selectedItemValue
                        : (selectedItem?.selectedLabel ?? '')
                      : query
                }
                onChange={(event) => {
                  const value = transform
                    ? transform(event.target.value)
                    : event.target.value
                  setIsEditing(true)
                  setQuery(value)
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
            {(items.length > 0 || allowArbitraryValues) && virtualOptions.length > 0 && (
              <ComboboxOptions
                anchor="bottom start"
                // 13px gap is presumably because it's measured from inside the outline or something
                className={`ox-menu shadow-menu-inset pointer-events-auto ${zIndex} border-secondary relative w-[calc(var(--input-width)+var(--button-width))] overflow-y-auto border [--anchor-gap:13px]`}
                style={{ minHeight, minWidth: panelWidth }}
                modal={false}
              >
                {({ option }: { option: ComboboxItem }) => {
                  const noMatch = option === NO_MATCH_ITEM
                  return (
                    <ComboboxOption
                      value={option}
                      disabled={noMatch}
                      className="border-secondary relative w-full border-b last:border-0"
                    >
                      {({ focus, selected }) => (
                        // This *could* be done with data-[focus] and data-[selected] instead, but
                        // it would be a lot more verbose. those can only be used with TW classes,
                        // not our .is-selected and .is-highlighted, so we'd have to copy the pieces
                        // of those rules one by one. Better to rely on the shared classes.
                        <div
                          className={cn('ox-menu-item', {
                            // suppress when the user is actively typing the selected
                            // value (e.g. the synthesized "Custom: <query>" row in
                            // arbitrary-values mode) so the row doesn't read as
                            // committed mid-keystroke
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
