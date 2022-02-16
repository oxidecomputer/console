import React from 'react'
import { Formik, Form } from 'formik'

import { Button, FieldTitle, SideModal, TextField } from '@oxide/ui'
import type { VpcRouter, ErrorResponse } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { getServerError } from 'app/util/errors'

// this will get a lot more interesting once the API is updated to allow us to
// put rules in the router, which is the whole point of a router

type FormProps = {
  error: ErrorResponse | null
  id: string
}

// the moment the two forms diverge, inline them rather than introducing BS
// props here
const CommonForm = ({ error, id }: FormProps) => (
  <Form id={id}>
    <SideModal.Section className="border-t">
      <div className="space-y-0.5">
        <FieldTitle htmlFor="router-name" tip="The name of the router">
          Name
        </FieldTitle>
        <TextField id="router-name" name="name" />
      </div>
      <div className="space-y-0.5">
        <FieldTitle
          htmlFor="router-description"
          tip="A description for the router"
        >
          Description {/* TODO: indicate optional */}
        </FieldTitle>
        <TextField id="router-description" name="description" />
      </div>
    </SideModal.Section>
    <SideModal.Section>
      <div className="text-destructive">{getServerError(error)}</div>
    </SideModal.Section>
  </Form>
)

type CreateProps = {
  isOpen: boolean
  onDismiss: () => void
  orgName: string
  projectName: string
  vpcName: string
}

export function CreateVpcRouterModal({
  isOpen,
  onDismiss,
  orgName,
  projectName,
  vpcName,
}: CreateProps) {
  const parentIds = { orgName, projectName, vpcName }
  const queryClient = useApiQueryClient()

  function dismiss() {
    createRouter.reset()
    onDismiss()
  }

  const createRouter = useApiMutation('vpcRoutersPost', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRoutersGet', parentIds)
      dismiss()
    },
  })

  const formId = 'create-vpc-router-form'

  return (
    <SideModal
      id="create-vpc-router-modal"
      title="Create router"
      isOpen={isOpen}
      onDismiss={dismiss}
    >
      <Formik
        initialValues={{ name: '', description: '' }}
        onSubmit={({ name, description }) => {
          createRouter.mutate({
            ...parentIds,
            body: { name, description },
          })
        }}
      >
        <CommonForm id={formId} error={createRouter.error} />
      </Formik>
      <SideModal.Footer>
        <Button variant="secondary" className="mr-2.5" onClick={dismiss}>
          Cancel
        </Button>
        <Button form={formId} type="submit">
          Create router
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}

type EditProps = {
  onDismiss: () => void
  orgName: string
  projectName: string
  vpcName: string
  originalRouter: VpcRouter | null
}

export function EditVpcRouterModal({
  onDismiss,
  orgName,
  projectName,
  vpcName,
  originalRouter,
}: EditProps) {
  const parentIds = { orgName, projectName, vpcName }
  const queryClient = useApiQueryClient()

  function dismiss() {
    updateRouter.reset()
    onDismiss()
  }

  const updateRouter = useApiMutation('vpcRoutersPutRouter', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRoutersGet', parentIds)
      dismiss()
    },
  })

  if (!originalRouter) return null

  const formId = 'edit-vpc-router-form'
  return (
    <SideModal
      id="edit-vpc-router-modal"
      title="Edit router"
      onDismiss={dismiss}
    >
      <Formik
        initialValues={{
          name: originalRouter.name,
          description: originalRouter.description,
        }}
        onSubmit={({ name, description }) => {
          updateRouter.mutate({
            ...parentIds,
            routerName: originalRouter.name,
            body: { name, description },
          })
        }}
      >
        <CommonForm id={formId} error={updateRouter.error} />
      </Formik>
      <SideModal.Footer>
        <Button variant="secondary" className="mr-2.5" onClick={dismiss}>
          Cancel
        </Button>
        <Button form={formId} type="submit">
          Update router
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
