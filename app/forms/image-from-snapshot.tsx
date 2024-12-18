/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { filesize } from 'filesize'
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  apiq,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type ImageCreate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { getProjectSnapshotSelector, useProjectSnapshotSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const defaultValues: Omit<ImageCreate, 'source'> = {
  name: '',
  description: '',
  os: '',
  version: '',
}

const snapshotView = ({ project, snapshot }: PP.Snapshot) =>
  apiq('snapshotView', { path: { snapshot }, query: { project } })

CreateImageFromSnapshotSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, snapshot } = getProjectSnapshotSelector(params)
  await queryClient.prefetchQuery(snapshotView({ project, snapshot }))
  return null
}

export function CreateImageFromSnapshotSideModalForm() {
  const { snapshot, project } = useProjectSnapshotSelector()
  const { data } = usePrefetchedQuery(snapshotView({ project, snapshot }))
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.snapshots({ project }))

  const createImage = useApiMutation('imageCreate', {
    onSuccess(image) {
      queryClient.invalidateEndpoint('imageList')
      addToast(<>Image <HL>{image.name}</HL> created</>) // prettier-ignore
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
      form={form}
      formType="create"
      resourceName="image"
      title="Create image from snapshot"
      submitLabel="Create image"
      onDismiss={onDismiss}
      onSubmit={(body) =>
        createImage.mutate({
          query: { project },
          body: { ...body, source: { type: 'snapshot', id: data.id } },
        })
      }
      submitError={createImage.error}
      loading={createImage.isPending}
    >
      <PropertiesTable>
        <PropertiesTable.Row label="Snapshot">{data.name}</PropertiesTable.Row>
        <PropertiesTable.Row label="Project">{project}</PropertiesTable.Row>
        <PropertiesTable.Row label="Size">
          {filesize(data.size, { base: 2 })}
        </PropertiesTable.Row>
      </PropertiesTable>

      <NameField name="name" control={form.control} required />
      <DescriptionField name="description" control={form.control} required />
      <TextField name="os" label="OS" control={form.control} required />
      <TextField name="version" control={form.control} required />
    </SideModalForm>
  )
}
