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

export function CreateVpcSubnetModal({
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
    createSubnet.reset()
    onDismiss()
  }

  const createSubnet = useApiMutation('vpcSubnetsPost', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetsGet', parentIds)
      dismiss()
    },
  })
  const formId = 'create-vpc-subnet-form'
  return (
    <SideModal
      id="create-vpc-subnet-modal"
      title="Create subnet"
      isOpen={isOpen}
      onDismiss={dismiss}
    >
      <Formik
        initialValues={{
          name: '',
          description: '',
          ipv4Block: '',
          ipv6Block: '',
        }}
        onSubmit={({ name, description, ipv4Block, ipv6Block }) => {
          createSubnet.mutate({
            ...parentIds,
            // XXX body is optional. useApiMutation should be smarter and require body when it's required
            body: {
              name,
              description,
              // TODO: validate these client-side using the patterns. sadly non-trivial
              ipv4Block: ipv4Block || null,
              ipv6Block: ipv6Block || null,
            },
          })
        }}
      >
        <Form id={formId}>
          <SideModal.Section>
            <div className="space-y-0.5">
              <FieldTitle htmlFor="subnet-ipv4-block" tip="TBA">
                IPv4 block
              </FieldTitle>
              <TextField id="subnet-ipv4-block" name="ipv4Block" />
            </div>
            <div className="space-y-0.5">
              <FieldTitle htmlFor="subnet-ipv6-block" tip="TBA">
                IPv6 block
              </FieldTitle>
              <TextField id="subnet-ipv6-block" name="ipv6Block" />
            </div>
          </SideModal.Section>
          <SideModal.Section className="border-t">
            <div className="space-y-0.5">
              <FieldTitle htmlFor="subnet-name" tip="The name of the subnet">
                Name
              </FieldTitle>
              <TextField id="subnet-name" name="name" />
            </div>
            <div className="space-y-0.5">
              <FieldTitle
                htmlFor="subnet-description"
                tip="A description for the subnet"
              >
                Description {/* TODO: indicate optional */}
              </FieldTitle>
              <TextField id="subnet-description" name="description" />
            </div>
          </SideModal.Section>
          <SideModal.Section>
            <div className="text-red-500">
              {getServerError(createSubnet.error)}
            </div>
          </SideModal.Section>
        </Form>
      </Formik>
      <SideModal.Footer>
        <Button variant="dim" className="mr-2.5" onClick={dismiss}>
          Cancel
        </Button>
        <Button form={formId} type="submit">
          Create subnet
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
