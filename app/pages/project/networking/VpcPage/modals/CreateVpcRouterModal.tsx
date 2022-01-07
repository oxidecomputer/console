import React from 'react'
import { Formik, Form } from 'formik'

import { Button, FieldTitle, SideModal, TextField } from '@oxide/ui'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { getServerError } from '../../../../../util/errors'

type Props = {
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
}: Props) {
  const parentIds = {
    organizationName: orgName,
    projectName,
    vpcName,
  }
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
        initialValues={{
          name: '',
          description: '',
        }}
        onSubmit={({ name, description }) => {
          createRouter.mutate({
            ...parentIds,
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
              {getServerError(createRouter.error)}
            </div>
          </SideModal.Section>
        </Form>
      </Formik>
      <SideModal.Footer>
        <Button variant="dim" className="mr-2.5" onClick={dismiss}>
          Cancel
        </Button>
        <Button form={formId} type="submit">
          Create router
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
