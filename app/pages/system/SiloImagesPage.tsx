import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Outlet } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import {
  Button,
  EmptyMessage,
  Images24Icon,
  Message,
  Modal,
  PageHeader,
  PageTitle,
  TableActions,
} from '@oxide/ui'

import { ListboxField, toListboxItem } from 'app/components/form'
import { useToast } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Images24Icon />}
    title="No images"
    body="You need to promote an image to be able to see it here"
  />
)

SiloImagesPage.loader = async () => {
  await apiQueryClient.prefetchQuery('imageList', {
    query: { limit: 10 },
  })
  return null
}

export function SiloImagesPage() {
  const { Table, Column } = useQueryTable('imageList', {})
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Images24Icon />}>Silo Images</PageTitle>
      </PageHeader>
      <TableActions>
        <Button size="sm" onClick={() => setShowModal(true)}>
          Promote image
        </Button>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="size" cell={SizeCell} />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      {showModal && <PromoteImageModal onDismiss={() => setShowModal(false)} />}
      <Outlet />
    </>
  )
}

type Values = { project: string | null; image: string | null }
const defaultValues: Values = { project: null, image: null }

const PromoteImageModal = ({ onDismiss }: { onDismiss: () => void }) => {
  const { control, handleSubmit, watch, resetField } = useForm({ defaultValues })

  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const promoteImage = useApiMutation('imagePromote', {
    onSuccess() {
      addToast({
        content: 'Image has been promoted',
      })
      queryClient.invalidateQueries('imageList', {})
    },
    onError: (error) => {
      const content =
        'message' in error ? (error.message as string) : 'Something went wrong'
      addToast({ title: 'Error', content, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  const projectsQuery = useApiQuery('projectList', {})
  const projects = projectsQuery.data?.items || []
  const selectedProject = watch('project')

  // can only fetch images if a project is selected
  const imagesQuery = useApiQuery(
    'imageList',
    { query: { project: selectedProject! } },
    { enabled: !!selectedProject }
  )
  const images = imagesQuery.data?.items || []

  const onSubmit = ({ image, project }: Values) => {
    if (!image || !project) return
    promoteImage.mutate({ path: { image }, query: { project } })
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
              items={projects.map((project) => {
                return { value: project.name, label: project.name }
              })}
              onChange={() => {
                resetField('image') // reset image field when the project changes
              }}
              isLoading={projectsQuery.isLoading}
              required
              control={control}
            />
            <ListboxField
              control={control}
              name="image"
              placeholder="Select an image"
              items={images.map((i) => toListboxItem(i))}
              isLoading={imagesQuery.isLoading}
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
