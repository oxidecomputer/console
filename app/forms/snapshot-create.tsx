/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import {
  diskCan,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  type PathParams as PP,
  type SnapshotCreate,
} from '@oxide/api'

import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

const useSnapshotDiskItems = (projectSelector: PP.Project) => {
  const { data: disks } = useApiQuery('diskList', {
    query: { ...projectSelector, limit: ALL_ISH },
  })
  return disks?.items.filter(diskCan.snapshot)
}

const defaultValues: SnapshotCreate = {
  description: '',
  disk: '',
  name: '',
}

export function CreateSnapshotSideModalForm() {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const navigate = useNavigate()

  const diskItems = useSnapshotDiskItems(projectSelector)
  const diskItemsForCombobox = useMemo(() => toComboboxItems(diskItems), [diskItems])

  const onDismiss = () => navigate(pb.snapshots(projectSelector))

  const createSnapshot = useApiMutation('snapshotCreate', {
    onSuccess(snapshot) {
      queryClient.invalidateQueries('snapshotList')
      addToast(<>Snapshot <HL>{snapshot.name}</HL> created</>) // prettier-ignore
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="snapshot"
      onDismiss={onDismiss}
      onSubmit={(values) => {
        createSnapshot.mutate({ query: projectSelector, body: values })
      }}
      submitError={createSnapshot.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <ComboboxField
        label="Disk"
        name="disk"
        placeholder="Select a disk"
        items={diskItemsForCombobox}
        required
        control={form.control}
      />
    </SideModalForm>
  )
}
