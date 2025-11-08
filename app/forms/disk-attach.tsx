/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { api, apiq, type ApiError } from '@oxide/api'

import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { ModalForm } from '~/components/form/ModalForm'
import { useProjectSelector } from '~/hooks/use-params'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { ALL_ISH } from '~/util/consts'

const defaultValues = { name: '' }

type AttachDiskProps = {
  /** If defined, this overrides the usual mutation */
  onSubmit: (diskAttach: { name: string; size: number }) => void
  onDismiss: () => void
  diskNamesToExclude?: string[]
  loading?: boolean
  submitError?: ApiError | null
}

/**
 * Can be used with either a `setState` or a real mutation as `onSubmit`, hence
 * the optional `loading` and `submitError`
 */
export function AttachDiskModalForm({
  onSubmit,
  onDismiss,
  diskNamesToExclude = [],
  loading = false,
  submitError = null,
}: AttachDiskProps) {
  const { project } = useProjectSelector()

  const { data, isPending } = useQuery(
    apiq(api.methods.diskList, { query: { project, limit: ALL_ISH } })
  )
  const detachedDisks = useMemo(
    () =>
      toComboboxItems(
        data?.items.filter(
          (d) => d.state.state === 'detached' && !diskNamesToExclude.includes(d.name)
        )
      ),
    [data, diskNamesToExclude]
  )

  const form = useForm({ defaultValues })
  const { control } = form

  return (
    <ModalForm
      form={form}
      onDismiss={onDismiss}
      submitLabel="Attach disk"
      submitError={submitError}
      loading={loading}
      title="Attach disk"
      onSubmit={({ name }) => {
        // because the ComboboxField is required and does not allow arbitrary
        // values (values not in the list of disks), we can only get here if the
        // disk is defined and in the list
        const disk = data!.items.find((d) => d.name === name)!
        onSubmit({ name, size: disk.size })
      }}
    >
      <ComboboxField
        label="Disk name"
        placeholder="Select a disk"
        name="name"
        items={detachedDisks}
        required
        control={control}
        isLoading={isPending}
      />
    </ModalForm>
  )
}
