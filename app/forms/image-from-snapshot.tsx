import fileSize from 'filesize'
import { useForm } from 'react-hook-form'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import {
  type ImageCreate,
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
} from '@oxide/api'
import { PropertiesTable } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import { getProjectSnapshotSelector, useProjectSnapshotSelector } from 'app/hooks'
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
  const { data } = useApiQuery('snapshotView', { path: { snapshot }, query: { project } })
  invariant(data, 'Snapshot must be prefetched in loader')
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()

  const onDismiss = () => navigate(pb.snapshots({ project }))

  const createImage = useApiMutation('imageCreate', {
    onSuccess() {
      queryClient.invalidateQueries('imageList', { query: { project } })
      addToast({
        content: 'Your image has been created',
      })
      onDismiss()
    },
  })

  const form = useForm({
    mode: 'all',
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
    >
      <PropertiesTable>
        <PropertiesTable.Row label="Snapshot">{data.name}</PropertiesTable.Row>
        <PropertiesTable.Row label="Shared with">{project}</PropertiesTable.Row>
        <PropertiesTable.Row label="Size">{fileSize(data.size)}</PropertiesTable.Row>
      </PropertiesTable>

      <NameField name="name" control={form.control} required />
      <DescriptionField name="description" control={form.control} required />
      <TextField name="os" label="OS" control={form.control} required />
      <TextField name="version" control={form.control} required />
    </SideModalForm>
  )
}
