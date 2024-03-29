/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback, useState } from 'react'
import { Link, Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQueryClient, type Image } from '@oxide/api'
import { Images24Icon } from '@oxide/design-system/icons/react'

import { getProjectSelector, useProjectSelector, useToast } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { DateCell } from '~/table/cells/DateCell'
import { linkCell } from '~/table/cells/LinkCell'
import { SizeCell } from '~/table/cells/SizeCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Images24Icon />}
    title="No images"
    body="You need to create an image to be able to see it here"
    // buttonText="New image"
    // buttonTo="new"
  />
)

ImagesPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await apiQueryClient.prefetchQuery('imageList', {
    query: { project, limit: 25 },
  })
  return null
}

export function ImagesPage() {
  const projectSelector = useProjectSelector()
  const { Table, Column } = useQueryTable('imageList', { query: projectSelector })
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const [promoteImageName, setPromoteImageName] = useState<string | null>(null)

  const deleteImage = useApiMutation('imageDelete', {
    onSuccess(_data, variables) {
      addToast({ content: `${variables.path.image} has been deleted` })
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
            deleteImage.mutateAsync({
              path: { image: image.name },
              query: projectSelector,
            }),
          label: image.name,
        }),
      },
    ],
    [deleteImage, projectSelector]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Images24Icon />}>Images</PageTitle>
      </PageHeader>
      <TableActions>
        <Link
          to={pb.projectImagesNew(projectSelector)}
          className={buttonStyle({ size: 'sm' })}
        >
          Upload image
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column
          accessor="name"
          cell={linkCell((image) => pb.projectImageEdit({ ...projectSelector, image }))}
        />
        <Column accessor="description" />
        <Column accessor="size" cell={SizeCell} />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
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
  const projectSelector = useProjectSelector()
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const promoteImage = useApiMutation('imagePromote', {
    onSuccess(data) {
      addToast({
        content: `${data.name} has been promoted`,
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
    promoteImage.mutate({ path: { image: imageName }, query: projectSelector })
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
