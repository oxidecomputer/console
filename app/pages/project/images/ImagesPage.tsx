import { useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'

import { type Image, apiQueryClient, useApiMutation, useApiQueryClient } from '@oxide/api'
import { DateCell, type MenuAction, SizeCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  Images24Icon,
  Modal,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { getProjectSelector, useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

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
    query: { project, limit: 10 },
  })
  return null
}

export function ImagesPage() {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const { Table, Column } = useQueryTable('imageList', { query: projectSelector })
  const addToast = useToast()

  const [promoteImageName, setPromoteImageName] = useState<string | null>(null)

  const promoteImage = useApiMutation('imagePromote', {
    onSuccess() {
      queryClient.invalidateQueries('imageList', { query: projectSelector })
    },
  })

  const makeActions = (image: Image): MenuAction[] => [
    {
      label: 'Promote image',
      onActivate: () => setPromoteImageName(image.name),
    },
  ]

  const handlePromote = () => {
    if (promoteImageName === null) {
      handleError('Missing image name')
      return
    }

    promoteImage.mutate(
      { path: { image: promoteImageName }, query: projectSelector },
      {
        onSuccess: () => {
          addToast({
            content: 'Image has been promoted',
            cta: {
              text: 'View silo images',
              link: '/images',
            },
          })
          setPromoteImageName(null)
        },
        onError: (error) => {
          handleError(
            'message' in error ? (error.message as string) : 'Something went wrong'
          )
        },
      }
    )
  }

  const handleError = (error: string) => {
    addToast({
      title: 'Error',
      content: error,
      variant: 'error',
    })
    setPromoteImageName(null)
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Images24Icon />}>Images</PageTitle>
      </PageHeader>
      <TableActions>
        <Link
          to={pb.projectImageNew(projectSelector)}
          className={buttonStyle({ size: 'sm' })}
        >
          Upload image
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="size" cell={SizeCell} />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      {promoteImageName && (
        <PromoteImageModal
          onDismiss={() => setPromoteImageName(null)}
          onAction={handlePromote}
          imageName={promoteImageName}
        />
      )}
      <Outlet />
    </>
  )
}

const PromoteImageModal = ({
  onDismiss,
  onAction,
  imageName,
}: {
  onDismiss: () => void
  onAction: () => void
  imageName: string
}) => {
  return (
    <Modal isOpen onDismiss={onDismiss}>
      <Modal.Title>Promote image</Modal.Title>
      <Modal.Body>
        <Modal.Section>
          <p>
            Are you sure you want to promote{' '}
            <span className="text-sans-semi-md text-accent-secondary">{imageName}</span>?
          </p>
          <p>Once an image has been promoted it is visible to all projects in a silo.</p>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer onDismiss={onDismiss} onAction={onAction} actionText="Promote" />
    </Modal>
  )
}
