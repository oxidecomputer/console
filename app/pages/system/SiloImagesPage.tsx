import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Control, FieldValues } from 'react-hook-form'
import { Outlet } from 'react-router-dom'

import {
  type Image,
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
} from '@oxide/api'
import { DateCell, type MenuAction, SizeCell, useQueryTable } from '@oxide/table'
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

import { ListboxField } from 'app/components/form'
import { useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

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

  const [demoteImage, setDemoteImage] = useState<Image | null>(null)

  const makeActions = (image: Image): MenuAction[] => [
    {
      label: 'Demote',
      onActivate: () => setDemoteImage(image),
    },
  ]

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
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="size" cell={SizeCell} />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      {showModal && <PromoteImageModal onDismiss={() => setShowModal(false)} />}
      {demoteImage && (
        <DemoteImageModal onDismiss={() => setDemoteImage(null)} image={demoteImage} />
      )}
      <Outlet />
    </>
  )
}

const PromoteImageModal = ({ onDismiss }: { onDismiss: () => void }) => {
  const { control, handleSubmit, watch, resetField } = useForm()

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

  const onSubmit = (data: FieldValues) => {
    promoteImage.mutate({ path: { image: data.image }, query: { project: data.project } })
  }

  return (
    <Modal isOpen onDismiss={onDismiss} title="Promote image">
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
            <ImageListboxField control={control} project={selectedProject} />
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

const ImageListboxField = ({
  control,
  project,
}: {
  control: Control<FieldValues>
  project: string
}) => {
  const imagesQuery = useApiQuery('imageList', { query: { project: project } })
  const images = imagesQuery.data?.items || []

  return (
    <ListboxField
      control={control}
      name="image"
      placeholder="Select an image"
      items={images.map((i) => {
        return {
          value: i.name,
          labelString: `${i.name} (${i.os}, ${i.version})`,
          label: (
            <>
              <div>{i.name}</div>
              <div className="text-secondary">
                {i.os} <span className="text-quinary">/</span> {i.version}
              </div>
            </>
          ),
        }
      })}
      isLoading={imagesQuery.isLoading}
      required
      disabled={!project}
    />
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
  const addToast = useToast()
  const demoteImage = useApiMutation('imageDemote', {
    onSuccess() {
      addToast({
        content: 'Image has been demoted',
        cta: selectedProject
          ? {
              text: `View images in ${selectedProject}`,
              link: pb.projectImages({ project: selectedProject }),
            }
          : undefined,
      })

      queryClient.invalidateQueries('imageList')
    },
    onError: (error) => {
      const content =
        'message' in error ? (error.message as string) : 'Something went wrong'
      addToast({ title: 'Error', content, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  const onSubmit = (data: FieldValues) => {
    demoteImage.mutate({ path: { image: image.id }, query: { project: data.project } })
  }

  const projectsQuery = useApiQuery('projectList', {})
  const projects = projectsQuery.data?.items || []

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
              items={projects.map((project) => {
                return { value: project.name, label: project.name }
              })}
              isLoading={projectsQuery.isLoading}
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
