/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import fileSize from 'filesize'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type ImageCreate,
} from '@oxide/api'
import { PropertiesTable } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import { getProjectSnapshotSelector, useForm, useProjectSnapshotSelector } from 'app/hooks'
import { addToast } from 'app/stores/toast'
import { pb } from 'app/util/path-builder'

const defaultValues: Omit<ImageCreate, 'source'> = {
  name: '',
  description: '',
  os: '',
  version: '',
}

CreateImageFromSnapshotSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, snapshot } = getProjectSnapshotSelector(params)
  await apiQueryClient.prefetchQuery('snapshotView', {
    path: { snapshot },
    query: { project },
  })
  return null
}

export function CreateImageFromSnapshotSideModalForm() {
  const { snapshot, project } = useProjectSnapshotSelector()
  const { data } = usePrefetchedApiQuery('snapshotView', {
    path: { snapshot },
    query: { project },
  })
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()

  const onDismiss = () => navigate(pb.snapshots({ project }))

  const createImage = useApiMutation('imageCreate', {
    onSuccess() {
      queryClient.invalidateQueries('imageList')
      addToast({ content: 'Your image has been created' })
      onDismiss()
    },
  })

  const form = useForm({
    defaultValues: {
      ...defaultValues,
      name: data.name,
    },
  })

  return (
    <SideModalForm
      id="create-image-from-snapshot-form"
      form={form}
      title={`Create image from snapshot`}
      submitLabel="Create image"
      onDismiss={onDismiss}
      onSubmit={(body) =>
        createImage.mutate({
          query: { project },
          body: { ...body, source: { type: 'snapshot', id: data.id } },
        })
      }
      submitError={createImage.error}
    >
      <PropertiesTable>
        <PropertiesTable.Row label="Snapshot">{data.name}</PropertiesTable.Row>
        <PropertiesTable.Row label="Project">{project}</PropertiesTable.Row>
        <PropertiesTable.Row label="Size">
          {fileSize(data.size, { base: 2 })}
        </PropertiesTable.Row>
      </PropertiesTable>

      <NameField name="name" control={form.control} required />
      <DescriptionField name="description" control={form.control} required />
      <TextField name="os" label="OS" control={form.control} required />
      <TextField name="version" control={form.control} required />
    </SideModalForm>
  )
}
