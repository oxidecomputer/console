import { useForm } from 'react-hook-form'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { type Image, apiQueryClient, useApiQuery } from '@oxide/api'
import { Images16Icon, PropertiesTable, ResourceLabel, Truncate } from '@oxide/ui'
import { bytesToGiB, formatDateTime, toPathQuery } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import {
  getProjectImageSelector,
  getSiloImageSelector,
  useProjectImageSelector,
  useSiloImageSelector,
} from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditProjectImageSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery(
    'imageView',
    toPathQuery('image', getProjectImageSelector(params))
  )
  return null
}

export function EditProjectImageSideModalForm() {
  const projectImageSelector = useProjectImageSelector()
  const projectImageQuery = toPathQuery('image', projectImageSelector)
  const { data: image } = useApiQuery('imageView', projectImageQuery)

  return (
    <EditImageSideModalForm
      image={image}
      dismissLink={pb.projectImages({ project: projectImageSelector.project })}
    />
  )
}

EditSiloImageSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery(
    'imageView',
    toPathQuery('image', getSiloImageSelector(params))
  )
  return null
}

export function EditSiloImageSideModalForm() {
  const siloImageSelector = useSiloImageSelector()
  const siloImageQuery = toPathQuery('image', siloImageSelector)
  const { data: image } = useApiQuery('imageView', siloImageQuery)

  return <EditImageSideModalForm image={image} dismissLink={pb.siloImages()} />
}

export function EditImageSideModalForm({
  image,
  dismissLink,
}: {
  image: Image | undefined
  dismissLink: string
}) {
  const navigate = useNavigate()
  const onDismiss = () => navigate(dismissLink)

  invariant(image, 'IdP was not prefetched in loader')

  const form = useForm({ mode: 'all', defaultValues: image })

  return (
    <SideModalForm
      id="edit-project-image-form"
      form={form}
      title="Project image"
      onDismiss={onDismiss}
      subtitle={
        <ResourceLabel>
          <Images16Icon /> {image.name}
        </ResourceLabel>
      }
    >
      <PropertiesTable>
        {/* <PropertiesTable.Row label="Shared with">Project</PropertiesTable.Row> */}
        <PropertiesTable.Row label="ID">
          <Truncate text={image.id} maxLength={32} hasCopyButton />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Size">
          <span>{bytesToGiB(image.size)}</span>
          <span className="ml-1 inline-block text-quaternary">GiB</span>
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Created">
          {formatDateTime(image.timeCreated)}
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Updated">
          {formatDateTime(image.timeModified)}
        </PropertiesTable.Row>
      </PropertiesTable>

      <NameField name="name" control={form.control} disabled />
      <DescriptionField name="description" control={form.control} required disabled />
      <TextField name="os" label="OS" control={form.control} required disabled />
      <TextField name="version" control={form.control} required disabled />
    </SideModalForm>
  )
}
