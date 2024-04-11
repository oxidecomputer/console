/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router-dom'

import {
  diskCan,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  type PathParams as PP,
  type SnapshotCreate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useForm, useProjectSelector } from '~/hooks'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

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
      <ListboxField name="disk" items={diskItems} required control={form.control} />
    </SideModalForm>
  )
}
