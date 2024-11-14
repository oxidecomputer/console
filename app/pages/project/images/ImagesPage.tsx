/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQueryClient, type Image } from '@oxide/api'
import { Images16Icon, Images24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { getActionsCol, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Images24Icon />}
    title="No images"
    body="Create an image to see it here"
    // buttonText="New image"
    // buttonTo="new"
  />
)

const colHelper = createColumnHelper<Image>()

ImagesPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await apiQueryClient.prefetchQuery('imageList', {
    query: { project, limit: PAGE_SIZE },
  })
  return null
}

export function ImagesPage() {
  const { project } = useProjectSelector()
  const { Table } = useQueryTable('imageList', { query: { project } })
  const queryClient = useApiQueryClient()

  const [promoteImageName, setPromoteImageName] = useState<string | null>(null)

  const { mutateAsync: deleteImage } = useApiMutation('imageDelete', {
    onSuccess(_data, variables) {
      addToast(<>Image <HL>{variables.path.image}</HL> deleted</>) // prettier-ignore
      queryClient.invalidateQueries('imageList')
    },
  })

  const makeActions = useCallback(
    (image: Image): MenuAction[] => [
      {
        label: 'Promote',
        onActivate: () => setPromoteImageName(image.name),
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () =>
            deleteImage({
              path: { image: image.name },
              query: { project },
            }),
          label: image.name,
        }),
      },
    ],
    [deleteImage, project]
  )

  const columns = useMemo(() => {
    return [
      colHelper.accessor('name', {
        cell: makeLinkCell((image) => pb.projectImageEdit({ project, image })),
      }),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('size', Columns.size),
      colHelper.accessor('timeCreated', Columns.timeCreated),
      getActionsCol(makeActions),
    ]
  }, [project, makeActions])

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Images24Icon />}>Project Images</PageTitle>
        <DocsPopover
          heading="Images"
          icon={<Images16Icon />}
          summary="Images let you create a new disk based on an existing one. Images can be uploaded directly or created from a snapshot."
          links={[docLinks.images]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.projectImagesNew({ project })}>Upload image</CreateLink>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
      {promoteImageName && (
        <PromoteImageModal
          onDismiss={() => setPromoteImageName(null)}
          imageName={promoteImageName}
        />
      )}
      <Outlet />
    </>
  )
}

type PromoteModalProps = { onDismiss: () => void; imageName: string }

const PromoteImageModal = ({ onDismiss, imageName }: PromoteModalProps) => {
  const { project } = useProjectSelector()
  const queryClient = useApiQueryClient()

  const promoteImage = useApiMutation('imagePromote', {
    onSuccess(data) {
      addToast({
        content: (
          <>
            Image <HL>{data.name}</HL> promoted
          </>
        ),
        cta: {
          text: 'View silo images',
          link: '/images',
        },
      })
      queryClient.invalidateQueries('imageList')
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  const onAction = () => {
    promoteImage.mutate({ path: { image: imageName }, query: { project } })
  }

  return (
    <Modal isOpen onDismiss={onDismiss} title="Promote image">
      <Modal.Body>
        <Modal.Section>
          <p>
            Are you sure you want to promote{' '}
            <span className="text-sans-semi-md text-default">{imageName}</span>?
          </p>
          <Message
            variant="info"
            content="Once an image has been promoted it is visible to all projects in a silo"
          />
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer onDismiss={onDismiss} onAction={onAction} actionText="Promote" />
    </Modal>
  )
}
