/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Outlet } from 'react-router'

import { apiq, getListQFn, queryClient, useApiMutation, type Image } from '@oxide/api'
import { Images16Icon, Images24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { toImageComboboxItem } from '~/components/form/fields/ImageSelectField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { ModalForm } from '~/components/form/ModalForm'
import { HL } from '~/components/HL'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { Button } from '~/ui/lib/Button'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Images24Icon />}
    title="No images"
    body="Promote an image to see it here"
  />
)

const imageList = getListQFn('imageList', {})

export async function clientLoader() {
  await queryClient.prefetchQuery(imageList.optionsFn())
  return null
}

export const handle = { crumb: 'Images' }

const colHelper = createColumnHelper<Image>()
const staticCols = [
  colHelper.accessor('name', {
    cell: makeLinkCell((image) => pb.siloImageEdit({ image })),
  }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('size', Columns.size),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export default function SiloImagesPage() {
  const [showModal, setShowModal] = useState(false)
  const [demoteImage, setDemoteImage] = useState<Image | null>(null)

  const { mutateAsync: deleteImage } = useApiMutation('imageDelete', {
    onSuccess(_data, variables) {
      addToast(<>Image <HL>{variables.path.image}</HL> deleted</>) // prettier-ignore
      queryClient.invalidateEndpoint('imageList')
    },
  })

  const makeActions = useCallback(
    (image: Image): MenuAction[] => [
      {
        label: 'Demote',
        onActivate: () => setDemoteImage(image),
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteImage({ path: { image: image.name } }),
          label: image.name,
        }),
      },
    ],
    [deleteImage]
  )

  const columns = useColsWithActions(staticCols, makeActions)
  const { table } = useQueryTable({ query: imageList, columns, emptyState: <EmptyState /> })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Images24Icon />}>Silo Images</PageTitle>
        <DocsPopover
          heading="images"
          icon={<Images16Icon />}
          summary="Images let you create a new disk based on an existing one. Silo images must be created within a project and then promoted."
          links={[docLinks.images]}
        />
      </PageHeader>
      <TableActions>
        <Button size="sm" onClick={() => setShowModal(true)}>
          Promote image
        </Button>
      </TableActions>
      {table}
      {showModal && <PromoteImageModal onDismiss={() => setShowModal(false)} />}
      {demoteImage && (
        <DemoteImageModal onDismiss={() => setDemoteImage(null)} image={demoteImage} />
      )}
      <Outlet />
    </>
  )
}

type Values = { project: string | null; image: string | null }
const defaultValues: Values = { project: null, image: null }

const PromoteImageModal = ({ onDismiss }: { onDismiss: () => void }) => {
  const form = useForm({ defaultValues })

  const promoteImage = useApiMutation('imagePromote', {
    onSuccess(data) {
      addToast(<>Image <HL>{data.name}</HL> promoted</>) // prettier-ignore
      queryClient.invalidateEndpoint('imageList')
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  const projects = useQuery(apiq('projectList', {}))
  const projectItems = useMemo(() => toComboboxItems(projects.data?.items), [projects.data])
  const selectedProject = form.watch('project')

  // can only fetch images if a project is selected
  const images = useQuery(
    apiq(
      'imageList',
      { query: { project: selectedProject! } },
      { enabled: !!selectedProject }
    )
  )
  const imageItems = useMemo(
    () => (images.data?.items || []).map((i) => toImageComboboxItem(i)),
    [images.data]
  )

  return (
    <ModalForm
      title="Promote image"
      form={form}
      loading={promoteImage.isPending}
      submitError={promoteImage.error}
      onSubmit={({ image, project }) => {
        if (!image || !project) return // shouldn't happen because of validation
        promoteImage.mutate({ path: { image } })
      }}
      onDismiss={onDismiss}
      submitLabel="Promote"
    >
      <ComboboxField
        placeholder="Select a project"
        name="project"
        label="Project"
        items={projectItems}
        onChange={() => {
          form.resetField('image') // reset image field when the project changes
        }}
        isLoading={projects.isPending}
        required
        control={form.control}
      />
      <ListboxField
        control={form.control}
        name="image"
        placeholder="Select an image"
        items={imageItems}
        isLoading={images.isPending}
        required
        disabled={!selectedProject}
      />
      <Message
        variant="info"
        content="Once an image has been promoted it is visible to all projects in a silo"
      />
    </ModalForm>
  )
}

type DemoteFormValues = {
  project: string | undefined
}

const DemoteImageModal = ({
  onDismiss,
  image,
}: {
  onDismiss: () => void
  image: Image
}) => {
  const defaultValues: DemoteFormValues = { project: undefined }
  const form = useForm({ defaultValues })

  const selectedProject: string | undefined = form.watch('project')

  const demoteImage = useApiMutation('imageDemote', {
    onSuccess(data) {
      addToast({
        content: <>Image <HL>{data.name}</HL> demoted</>, // prettier-ignore
        cta: selectedProject
          ? {
              text: `View images in ${selectedProject}`,
              link: pb.projectImages({ project: selectedProject }),
            }
          : undefined,
      })

      queryClient.invalidateEndpoint('imageList')
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  const projects = useQuery(apiq('projectList', {}))
  const projectItems = useMemo(() => toComboboxItems(projects.data?.items), [projects.data])

  return (
    <ModalForm
      title="Demote image"
      form={form}
      loading={demoteImage.isPending}
      submitError={demoteImage.error}
      onSubmit={({ project }) => {
        if (!project) return // shouldn't happen because of validation
        demoteImage.mutate({ path: { image: image.id }, query: { project } })
      }}
      onDismiss={onDismiss}
      submitLabel="Demote"
    >
      <p>
        Demoting: <span className="text-sans-semi-md text-raise">{image.name}</span>
      </p>

      <Message
        variant="info"
        content="Once an image has been demoted it is only visible within the project that it is demoted into. This will not affect disks already created with the image."
      />

      <ComboboxField
        placeholder="Select project for image"
        name="project"
        label="Project"
        items={projectItems}
        isLoading={projects.isPending}
        required
        control={form.control}
      />
    </ModalForm>
  )
}
