/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Combobox } from '@headlessui/react'
import cn from 'classnames'
import { useState } from 'react'

import { useApiQuery, type ApiError } from '@oxide/api'
import { DirectionDownIcon } from '@oxide/design-system/icons/react'

import { ListboxField } from '~/components/form/fields/ListboxField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useForm, useProjectSelector } from '~/hooks'

const defaultValues = { name: '' }

type AttachDiskProps = {
  /** If defined, this overrides the usual mutation */
  onSubmit: (diskAttach: { name: string }) => void
  onDismiss: () => void
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
      (d) => d.state.state === 'detached'
    ) || []

  const [selectedDisk, setSelectedDisk] = useState(detachedDisks[0])
  const [query, setQuery] = useState('')
  const filteredDisks =
    query === ''
      ? detachedDisks
      : detachedDisks.filter((d) => d.name.includes(query.toLowerCase()))

  const form = useForm({ defaultValues })

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
      <ListboxField
        label="Disk name"
        name="name"
        items={detachedDisks.map(({ name }) => ({ value: name, label: name }))}
        required
        control={form.control}
      />

      <div className="relative">
        <Combobox value={selectedDisk} onChange={setSelectedDisk}>
          <div className="flex h-10 w-full items-center justify-between rounded border text-sans-md bg-default border-default hover:border-hover">
            <Combobox.Input
              className="bg-default"
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className="flex items-center pr-2">
              <DirectionDownIcon className="text-gray-400 h-5 w-5" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="ox-menu bg-default">
            {filteredDisks.map((d) => (
              <Combobox.Option
                key={d.name}
                value={d.name}
                className={({ active }) => cn('ox-menu-item', active && 'is-highlighted')}
              >
                {d.name}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox>
      </div>
    </SideModalForm>
  )
}
