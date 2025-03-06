/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { instanceCan, useApiQuery, type ApiError, type Instance } from '@oxide/api'

import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { ModalForm } from '~/components/form/ModalForm'
import { StopInstancePrompt } from '~/components/StopInstancePrompt'
import { useProjectSelector } from '~/hooks/use-params'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { ALL_ISH } from '~/util/consts'

const defaultValues = { name: '' }

type AttachDiskProps = {
  /** If defined, this overrides the usual mutation */
  onSubmit: (diskAttach: { name: string }) => void
  onDismiss: () => void
  diskNamesToExclude?: string[]
  loading?: boolean
  submitError?: ApiError | null
  instance?: Instance
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
  instance,
}: AttachDiskProps) {
  const { project } = useProjectSelector()

  const { data, isPending } = useApiQuery('diskList', {
    query: { project, limit: ALL_ISH },
  })
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
      onSubmit={onSubmit}
      submitDisabled={instance && !instanceCan.attachDisk(instance)}
    >
      {instance && ['stopping', 'running'].includes(instance.runState) && (
        <StopInstancePrompt instance={instance}>
          An instance must be stopped to attach a disk.
        </StopInstancePrompt>
      )}
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
