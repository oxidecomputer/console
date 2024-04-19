/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { type FieldValues } from 'react-hook-form'
import { Outlet } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  type Image,
} from '@oxide/api'
import { Images24Icon } from '@oxide/design-system/icons/react'

import { toListboxItem } from '~/components/form/fields/ImageSelectField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { useForm } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions, TableControlsButton } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Images24Icon />}
    title="No images"
    body="You need to promote an image to be able to see it here"
  />
)

SiloImagesPage.loader = async () => {
  await apiQueryClient.prefetchQuery('imageList', {
    query: { limit: PAGE_SIZE },
  })
  return null
}

const colHelper = createColumnHelper<Image>()
const staticCols = [
  colHelper.accessor('name', {
    cell: makeLinkCell((image) => pb.siloImageEdit({ image })),
  }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('size', Columns.size),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export function SiloImagesPage() {
  const { Table } = useQueryTable('imageList', {})
  const [showModal, setShowModal] = useState(false)
  const [demoteImage, setDemoteImage] = useState<Image | null>(null)

  const queryClient = useApiQueryClient()
  const deleteImage = useApiMutation('imageDelete', {
    onSuccess(_data, variables) {
      addToast({ content: `${variables.path.image} has been deleted` })
      queryClient.invalidateQueries('imageList')
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
          doDelete: () => deleteImage.mutateAsync({ path: { image: image.name } }),
          label: image.name,
        }),
      },
    ],
    [deleteImage]
  )

  const columns = useColsWithActions(staticCols, makeActions)
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Images24Icon />}>Silo Images</PageTitle>
      </PageHeader>
      <TableActions>
        <TableControlsButton onClick={() => setShowModal(true)}>
          Promote image
        </TableControlsButton>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
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
  const { control, handleSubmit, watch, resetField } = useForm({ defaultValues })

  const queryClient = useApiQueryClient()

  const promoteImage = useApiMutation('imagePromote', {
    onSuccess(data) {
      addToast({ content: `${data.name} has been promoted` })
      queryClient.invalidateQueries('imageList')
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  const projects = useApiQuery('projectList', {})
  const projectItems = useMemo(
    () => (projects.data?.items || []).map(({ name }) => ({ value: name, label: name })),
    [projects.data]
  )
  const selectedProject = watch('project')

  // can only fetch images if a project is selected
  const images = useApiQuery(
    'imageList',
    { query: { project: selectedProject! } },
    { enabled: !!selectedProject }
  )
  const imageItems = useMemo(
    () => (images.data?.items || []).map((i) => toListboxItem(i)),
    [images.data]
  )

  const onSubmit = ({ image, project }: Values) => {
    if (!image || !project) return
    promoteImage.mutate({ path: { image } })
  }

  return (
    <Modal isOpen onDismiss={onDismiss} title="Promote image">
      <Modal.Body>
        <Modal.Section>
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <ListboxField
              placeholder="Filter images by project"
              name="project"
              label="Project"
              items={projectItems}
              onChange={() => {
                resetField('image') // reset image field when the project changes
              }}
              isLoading={projects.isPending}
              required
              control={control}
            />
            <ListboxField
              control={control}
              name="image"
              placeholder="Select an image"
              items={imageItems}
              isLoading={images.isPending}
              required
              disabled={!selectedProject}
            />
          </form>
          <Message
            variant="info"
            content="Once an image has been promoted it is visible to all projects in a silo"
          />
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={handleSubmit(onSubmit)}
        actionText="Promote"
      />
    </Modal>
  )
}

const DemoteImageModal = ({
  onDismiss,
  image,
}: {
  onDismiss: () => void
  image: Image
}) => {
  const { control, handleSubmit, watch } = useForm()

  const selectedProject: string | undefined = watch('project')

  const queryClient = useApiQueryClient()

  const demoteImage = useApiMutation('imageDemote', {
    onSuccess(data) {
      addToast({
        content: `${data.name} has been demoted`,
        cta: selectedProject
          ? {
              text: `View images in ${selectedProject}`,
              link: pb.projectImages({ project: selectedProject }),
            }
          : undefined,
      })

      queryClient.invalidateQueries('imageList')
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  const onSubmit = (data: FieldValues) => {
    demoteImage.mutate({ path: { image: image.id }, query: { project: data.project } })
  }

  const projects = useApiQuery('projectList', {})
  const projectItems = useMemo(
    () => (projects.data?.items || []).map(({ name }) => ({ value: name, label: name })),
    [projects.data]
  )

  return (
    <Modal isOpen onDismiss={onDismiss} title="Demote image">
      <Modal.Body>
        <Modal.Section>
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.stopPropagation()
              handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <p>
              Demoting: <span className="text-sans-semi-md text-default">{image.name}</span>
            </p>

            <Message
              variant="info"
              content="Once an image has been demoted it is only visible to the project that it is demoted into. This will not affect disks already created with the image."
            />

            <ListboxField
              placeholder="Select project for image"
              name="project"
              label="Project"
              items={projectItems}
              isLoading={projects.isPending}
              required
              control={control}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={handleSubmit(onSubmit)}
        actionText="Demote"
      />
    </Modal>
  )
}
