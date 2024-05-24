/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type ApiError } from '@oxide/api'

import { ListboxField } from '~/components/form/fields/ListboxField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useForm } from '~/hooks'

const defaultValues = { name: '' }

type AttachDiskProps = {
  availableDiskNames: string[]
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
  availableDiskNames,
  onSubmit,
  onDismiss,
  loading,
  submitError = null,
}: AttachDiskProps) {
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
        items={availableDiskNames.map((name) => ({ value: name, label: name }))}
        required
        control={form.control}
      />
    </SideModalForm>
  )
}
