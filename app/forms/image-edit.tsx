/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery, type Image } from '@oxide/api'
import { Images16Icon } from '@oxide/design-system/icons/react'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import {
  getProjectImageSelector,
  getSiloImageSelector,
  useProjectImageSelector,
  useSiloImageSelector,
} from '~/hooks/use-params'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { pb } from '~/util/path-builder'
import { capitalize } from '~/util/str'
import { bytesToGiB } from '~/util/units'

export const ProjectImageEdit = {
  loader: async ({ params }: LoaderFunctionArgs) => {
    const { project, image } = getProjectImageSelector(params)
    await apiQueryClient.fetchQuery('imageView', { path: { image }, query: { project } })
    return null
  },
  Component: EditProjectImageSideModalForm,
}

export const SiloImageEdit = {
  loader: async ({ params }: LoaderFunctionArgs) => {
    const { image } = getSiloImageSelector(params)
    await apiQueryClient.fetchQuery('imageView', { path: { image } })
    return null
  },
  Component: EditSiloImageSideModalForm,
}

function EditProjectImageSideModalForm() {
  const { project, image } = useProjectImageSelector()
  const { data } = usePrefetchedApiQuery('imageView', {
    path: { image },
    query: { project },
  })

  const dismissLink = pb.projectImages({ project })
  return <EditImageSideModalForm image={data} dismissLink={dismissLink} type="Project" />
}

function EditSiloImageSideModalForm() {
  const { image } = useSiloImageSelector()
  const { data } = usePrefetchedApiQuery('imageView', { path: { image } })

  return <EditImageSideModalForm image={data} dismissLink={pb.siloImages()} type="Silo" />
}

function EditImageSideModalForm({
  image,
  dismissLink,
  type,
}: {
  image: Image
  dismissLink: string
  type: 'Project' | 'Silo'
}) {
  const navigate = useNavigate()
  const form = useForm({ defaultValues: image })
  const resourceName = type === 'Project' ? 'project image' : 'silo image'

  return (
    <SideModalForm
      title={capitalize(resourceName)}
      form={form}
      formType="edit"
      resourceName={resourceName}
      onDismiss={() => navigate(dismissLink)}
      subtitle={
        <ResourceLabel>
          <Images16Icon /> {image.name}
        </ResourceLabel>
      }
      // TODO: pass actual error when this form is hooked up
      submitError={null}
      loading={false}
    >
      <PropertiesTable>
        <PropertiesTable.Row label="Shared with">{type}</PropertiesTable.Row>
        <PropertiesTable.IdRow id={image.id} />
        <PropertiesTable.Row label="Size">
          <span>{bytesToGiB(image.size)}</span>
          <span className="ml-1 inline-block text-tertiary">GiB</span>
        </PropertiesTable.Row>
        <PropertiesTable.DateRow date={image.timeCreated} label="Created" />
        <PropertiesTable.DateRow date={image.timeModified} label="Updated" />
      </PropertiesTable>
      <NameField name="name" control={form.control} disabled />
      <DescriptionField name="description" control={form.control} required disabled />
      <TextField name="os" label="OS" control={form.control} required disabled />
      <TextField name="version" control={form.control} required disabled />
    </SideModalForm>
  )
}
