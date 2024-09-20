/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'

import { useApiQuery, type ApiError } from '@oxide/api'

import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useProjectSelector } from '~/hooks/use-params'
import { APPROXIMATELY_EVERYTHING } from '~/util/consts'

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
  const { project } = useProjectSelector()

  const { data } = useApiQuery('diskList', {
    query: { project, limit: APPROXIMATELY_EVERYTHING },
  })
  const detachedDisks =
    data?.items.filter(
      (d) => d.state.state === 'detached' && !diskNamesToExclude.includes(d.name)
    ) || []

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="disk"
      title="Attach disk"
      onSubmit={onSubmit}
      loading={loading}
      submitError={submitError}
      onDismiss={onDismiss}
    >
      <ComboboxField
        label="Disk name"
        placeholder="Select a disk"
        name="name"
        items={detachedDisks.map(({ name }) => ({ value: name, label: name }))}
        required
        control={form.control}
      />
    </SideModalForm>
  )
}
