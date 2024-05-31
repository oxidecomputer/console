/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import cn from 'classnames'
import { useState } from 'react'

import { useApiQuery, type ApiError } from '@oxide/api'
import { SelectArrows6Icon } from '@oxide/design-system/icons/react'

// import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useForm, useProjectSelector } from '~/hooks'

const defaultValues = { name: '' }

type AttachDiskProps = {
  /** If defined, this overrides the usual mutation */
  onSubmit: (diskAttach: { name: string }) => void
  onDismiss: () => void
  diskNamesToExclude?: string[]
  loading?: boolean
  submitError?: ApiError | null
}

/**
 * Can be used with either a `setState` or a real mutation as `onSubmit`, hence
 * the optional `loading` and `submitError`
 */
export function AttachDiskSideModalForm({
  onSubmit,
  onDismiss,
  diskNamesToExclude = [],
  loading,
  submitError = null,
}: AttachDiskProps) {
  const projectSelector = useProjectSelector()

  // TODO: loading state? because this fires when the modal opens and not when
  // they focus the combobox, it will almost always be done by the time they
  // click in
  // TODO: error handling
  const detachedDisks =
    useApiQuery('diskList', { query: projectSelector }).data?.items.filter(
      (d) => d.state.state === 'detached' && !diskNamesToExclude.includes(d.name)
    ) || []

  const form = useForm({ defaultValues })

  const [selectedDisk, setSelectedDisk] = useState('')
  const [query, setQuery] = useState('')

  const filteredDisks =
    query === ''
      ? detachedDisks
      : detachedDisks.filter((disk) => {
          return disk.name.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="disk"
      title="Attach Disk"
      onSubmit={onSubmit}
      loading={loading}
      submitError={submitError}
      onDismiss={onDismiss}
    >
      <Combobox
        value={selectedDisk}
        onChange={(name: string) => {
          setSelectedDisk(name)
        }}
        onClose={() => setQuery('')}
        defaultValue={selectedDisk}
      >
        <div className="flex rounded">
          <ComboboxInput
            aria-label="Assignee"
            displayValue={() => (selectedDisk ? selectedDisk : query)}
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
          {filteredDisks.map((disk) => (
            <ComboboxOption
              key={disk.id}
              value={disk.name}
              className={cn(
                'DropdownMenuItem ox-menu-item relative border-b text-tertiary border-secondary last:border-0 active:text-accent-secondary selected:text-accent-secondary'
              )}
              onSelect={() => {
                setSelectedDisk(disk.name)
                setQuery(disk.name)
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
                  {disk.name}
                </div>
              )}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
      {/* <ComboboxField
        label="Disk name"
        name="name"
        items={detachedDisks.map(({ name }) => ({ value: name, label: name }))}
        required
        control={form.control}
      /> */}
      <ListboxField
        label="Disk name"
        name="name"
        items={detachedDisks.map(({ name }) => ({ value: name, label: name }))}
        required
        control={form.control}
      />
    </SideModalForm>
  )
}
