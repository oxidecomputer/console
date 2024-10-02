/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  Field,
  Listbox as HListbox,
  Label,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react'
import cn from 'classnames'
import { type ReactNode, type Ref } from 'react'

import { SelectArrows6Icon } from '@oxide/design-system/icons/react'

import { FieldLabel } from './FieldLabel'
import { usePopoverZIndex } from './SideModal'
import { SpinnerLoader } from './Spinner'
import { TextInputHint } from './TextInput'

export type ListboxItem<Value extends string = string> = {
  value: Value
} & { label?: string | ReactNode; selectedLabel?: string }

export interface ListboxProps<Value extends string = string> {
  // null is allowed as a default empty value, but onChange will never be called with null
  selected: Value | null
  onChange: (value: Value) => void
  items: ListboxItem<Value>[]
  placeholder?: string
  noItemsPlaceholder?: string
  className?: string
  disabled?: boolean
  hasError?: boolean
  name?: string
  label?: React.ReactNode
  description?: React.ReactNode
  required?: boolean
  isLoading?: boolean
  /** Necessary if you want RHF to be able to focus it on error */
  buttonRef?: Ref<HTMLButtonElement>
  hideOptionalTag?: boolean
}

export const Listbox = <Value extends string = string>({
  name,
  selected,
  items,
  placeholder = 'Select an option',
  noItemsPlaceholder = 'No items',
  className,
  onChange,
  hasError = false,
  label,
  description,
  required,
  disabled,
  isLoading = false,
  buttonRef,
  hideOptionalTag,
  ...props
}: ListboxProps<Value>) => {
  const selectedItem = selected && items.find((i) => i.value === selected)
  const noItems = !isLoading && items.length === 0
  const isDisabled = disabled || noItems
  const zIndex = usePopoverZIndex()

  return (
    <Field className={cn('relative', className)}>
      {label && (
        <div className="mb-2">
          <FieldLabel id={``} as="div" optional={!required && !hideOptionalTag}>
            <Label>{label}</Label>
          </FieldLabel>
          {description && <TextInputHint id={``}>{description}</TextInputHint>}
        </div>
      )}
      <HListbox
        value={selected}
        // you shouldn't ever be able to select null, but we check here anyway
        // to make TS happy so the calling code doesn't have to. note `val !==
        // null` because '' is falsy but potentially a valid value
        onChange={(val) => val !== null && onChange(val)}
        disabled={isDisabled || isLoading}
      >
        <ListboxButton
          name={name}
          className={cn(
            `flex h-10 w-full items-center justify-between rounded border text-sans-md focus-within:ring-2 focus-within:ring-accent-secondary`,
            hasError
              ? 'focus-error border-error-secondary ring-error-secondary hover:border-error'
              : 'border-default hover:border-hover',
            isDisabled
              ? 'cursor-not-allowed text-disabled bg-disabled !border-default'
              : 'bg-default',
            isDisabled && hasError && '!border-error-secondary'
          )}
          ref={buttonRef}
          {...props}
        >
          <div className="w-full overflow-hidden overflow-ellipsis whitespace-pre px-3 text-left">
            {selectedItem ? (
              // selectedLabel is one line, which is what we need when label is a ReactNode
              selectedItem.selectedLabel || selectedItem.label
            ) : (
              <span className="text-quaternary">
                {noItems ? noItemsPlaceholder : placeholder}
              </span>
            )}
          </div>
          {!isDisabled && <SpinnerLoader isLoading={isLoading} />}
          <div
            className="flex h-[calc(100%-12px)] items-center border-l px-3 border-secondary"
            aria-hidden
          >
            <SelectArrows6Icon title="Select" className="w-2 text-tertiary" />
          </div>
        </ListboxButton>
        <ListboxOptions
          anchor={{ gap: 12 }}
          className={`ox-menu pointer-events-auto ${zIndex} w-[var(--button-width)] overflow-y-auto !outline-none`}
          // This is to prevent the `useOthersInert` call in ListboxOptions.
          // Without this, when the listbox options box scrolls under the
          // top bar (for example) you can click through the top bar to the
          // options because the topbar (and all other elements) has been
          // marked "inert", which means it does not catch mouse events.
          // This would not be necessary if useScrollLock in ListboxOptions
          // worked, but we suspect it doesn't work because the page as a
          // whole is not the scroll container.
          modal={false}
        >
          {items.map((item) => (
            <ListboxOption
              key={item.value}
              value={item.value}
              className="relative border-b border-secondary last:border-0"
            >
              {({ focus, selected }) => (
                <div
                  className={cn('ox-menu-item', {
                    'is-selected': selected,
                    'is-highlighted': focus,
                  })}
                >
                  {item.label}
                </div>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </HListbox>
    </Field>
  )
}
