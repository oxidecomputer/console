/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { Link, Outlet, type LoaderFunctionArgs } from 'react-router'

import { getListQFn, queryClient, useApiMutation, type Image } from '@oxide/api'
import { Images16Icon, Images24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { getActionsCol, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

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

const imageList = (query: PP.Project) => getListQFn('imageList', { query })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  await queryClient.prefetchQuery(imageList({ project }).optionsFn())
  return null
}

export const handle = makeCrumb('Images', (p) => pb.projectImages(getProjectSelector(p)))

export default function ImagesPage() {
  const { project } = useProjectSelector()

  const [promoteImageName, setPromoteImageName] = useState<string | null>(null)

  const { mutateAsync: deleteImage } = useApiMutation('imageDelete', {
    onSuccess(_data, variables) {
      addToast(<>Image <HL>{variables.path.image}</HL> deleted</>) // prettier-ignore
      queryClient.invalidateEndpoint('imageList')
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

  const { table } = useQueryTable({
    query: imageList({ project }),
    columns,
    emptyState: <EmptyState />,
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Images24Icon />}>Project Images</PageTitle>
        <div className="inline-flex gap-2">
          <Link
            to={pb.siloImages()}
            className={buttonStyle({ size: 'sm', variant: 'ghost' })}
          >
            Silo Images
          </Link>
          <DocsPopover
            heading="Images"
            icon={<Images16Icon />}
            summary="Images let you create a new disk based on an existing one. Images can be uploaded directly or created from a snapshot."
            links={[docLinks.images]}
          />
        </div>
      </PageHeader>
      {table}
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
      queryClient.invalidateEndpoint('imageList')
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
            <span className="text-sans-semi-md text-raise">{imageName}</span>?
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
