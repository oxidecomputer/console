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
import { useState } from 'react'

import { SelectArrows6Icon } from '@oxide/design-system/icons/react'

export const Combobox = ({ items }: { items: Array<{ label: string; value: string }> }) => {
  const [selectedItem, setSelectedItem] = useState('')
  const [query, setQuery] = useState('')

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
    <HCombobox
      value={selectedItem}
      onChange={(name: string) => {
        setSelectedItem(name)
      }}
      onClose={() => setQuery('')}
      defaultValue={selectedItem}
    >
      <div className="flex rounded">
        <ComboboxInput
          aria-label="Assignee"
          displayValue={() => (selectedItem ? selectedItem : query)}
          onChange={(event) => setQuery(event.target.value)}
          className={`w-full rounded border-none
          px-3 py-[0.6875rem] !outline-offset-1
          text-sans-md text-default bg-default
          placeholder:text-quaternary focus:outline-none disabled:cursor-not-allowed disabled:text-tertiary disabled:bg-disabled`}
        />
        <ComboboxButton>
          <div
            className="flex h-[calc(100%-12px)] items-center border-l px-3 bg-default border-secondary"
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
              setSelectedItem(item.label)
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
    </HCombobox>
  )
}
