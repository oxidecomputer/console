import React from 'react'
import { Formik, Form } from 'formik'

import { Button, FieldTitle, SideModal, TextField } from '@oxide/ui'
import type { VpcRouter } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { getServerError } from '../../../../../util/errors'

type Props = {
  onDismiss: () => void
  orgName: string
  projectName: string
  vpcName: string
  originalRouter: VpcRouter | null
}

// this will get a lot more interesting once the API is updated to allow us to
// put rules in the router, which is the whole point of a router

export function EditVpcRouterModal({
  onDismiss,
  orgName,
  projectName,
  vpcName,
  originalRouter,
}: Props) {
  const parentIds = {
    organizationName: orgName,
    projectName,
    vpcName,
  }
  const queryClient = useApiQueryClient()

  function dismiss() {
    updateRouter.reset()
    onDismiss()
  }

  const updateRouter = useApiMutation('vpcRoutersPutRouter', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRoutersGet', parentIds)
      updateRouter.reset()
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
          name: originalRouter.identity.name,
          description: originalRouter.identity.description,
        }}
        onSubmit={({ name, description }) => {
          updateRouter.mutate({
            ...parentIds,
            routerName: originalRouter.identity.name,
            body: { name, description },
          })
        }}
      >
        <Form id={formId}>
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
            <div className="text-red-500">
              {getServerError(updateRouter.error)}
            </div>
          </SideModal.Section>
        </Form>
      </Formik>
      <SideModal.Footer>
        <Button variant="dim" className="mr-2.5" onClick={dismiss}>
          Cancel
        </Button>
        <Button form={formId} type="submit">
          Update router
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
