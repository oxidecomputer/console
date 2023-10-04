/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router-dom'

import type { PathParams as PP, SnapshotCreate } from '@oxide/api'
import { diskCan } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'

import {
  DescriptionField,
  ListboxField,
  NameField,
  SideModalForm,
} from 'app/components/form'
import { useForm, useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const useSnapshotDiskItems = (projectSelector: PP.Project) => {
  const { data: disks } = useApiQuery('diskList', {
    query: { ...projectSelector, limit: 1000 },
  })
  return (
    disks?.items
      .filter(diskCan.snapshot)
      .map((disk) => ({ value: disk.name, label: disk.name })) || []
  )
}

const defaultValues: SnapshotCreate = {
  description: '',
  disk: '',
  name: '',
}

export function CreateSnapshotSideModalForm() {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const addToast = useToast()
  const navigate = useNavigate()

  const diskItems = useSnapshotDiskItems(projectSelector)

  const onDismiss = () => navigate(pb.snapshots(projectSelector))

  const createSnapshot = useApiMutation('snapshotCreate', {
    onSuccess() {
      queryClient.invalidateQueries('snapshotList')
      addToast({ content: 'Your snapshot has been created' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      id="create-snapshot-form"
      title="Create Snapshot"
      form={form}
      onDismiss={onDismiss}
      onSubmit={(values) => {
        createSnapshot.mutate({ query: projectSelector, body: values })
      }}
      submitError={createSnapshot.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <ListboxField name="disk" items={diskItems} required control={form.control} />
    </SideModalForm>
  )
}
