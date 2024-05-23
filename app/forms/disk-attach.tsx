/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { useState } from 'react'

import { useApiQuery, type ApiError } from '@oxide/api'

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

  const form = useForm({ defaultValues })

  const people = [
    { id: 1, name: 'Durward Reynolds' },
    { id: 2, name: 'Kenton Towne' },
    { id: 3, name: 'Therese Wunsch' },
    { id: 4, name: 'Benedict Kessler' },
    { id: 5, name: 'Katelyn Rohan' },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])
  const [query, setQuery] = useState('')

  console.log(query)
  const filteredPeople =
    query === ''
      ? people
      : people.filter((person) => {
          console.log(
            person,
            query,
            person.name.toLowerCase().includes(query.toLowerCase())
          )
          return person.name.toLowerCase().includes(query.toLowerCase())
        })

  console.log(filteredPeople)

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
        value={selectedPerson}
        onChange={(person: { id: number; name: string }) => {
          setSelectedPerson(person)
        }}
        onClose={() => setQuery('')}
      >
        <ComboboxInput
          aria-label="Assignee"
          displayValue={(person: { id: number; name: string }) => person?.name}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ComboboxOptions anchor="bottom" className="empty:hidden">
          {filteredPeople.map((person) => (
            <ComboboxOption
              key={person.id}
              value={person.name}
              className="data-[focus]:bg-blue-100"
            >
              {person.name}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
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
