import React from 'react'
import { Formik, Form } from 'formik'

import { Button, FieldTitle, SideModal, TextField } from '@oxide/ui'
import type { VpcSubnet, ErrorResponse } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { getServerError } from 'app/util/errors'

type FormProps = {
  error: ErrorResponse | null
  id: string
}

// the moment the two forms diverge, inline them rather than introducing BS
// props here
const CommonForm = ({ id, error }: FormProps) => (
  <Form id={id}>
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
      <div className="text-red-500">{getServerError(error)}</div>
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

export function CreateVpcSubnetModal({
  isOpen,
  onDismiss,
  orgName,
  projectName,
  vpcName,
}: CreateProps) {
  const parentIds = { orgName, projectName, vpcName }
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
        <CommonForm id={formId} error={createSubnet.error} />
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

type EditProps = {
  onDismiss: () => void
  orgName: string
  projectName: string
  vpcName: string
  originalSubnet: VpcSubnet | null
}

export function EditVpcSubnetModal({
  onDismiss,
  orgName,
  projectName,
  vpcName,
  originalSubnet,
}: EditProps) {
  const parentIds = { orgName, projectName, vpcName }
  const queryClient = useApiQueryClient()

  function dismiss() {
    updateSubnet.reset()
    onDismiss()
  }

  const updateSubnet = useApiMutation('vpcSubnetsPutSubnet', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetsGet', parentIds)
      dismiss()
    },
  })

  if (!originalSubnet) return null

  const formId = 'edit-vpc-subnet-form'
  return (
    <SideModal
      id="edit-vpc-subnet-modal"
      title="Edit subnet"
      onDismiss={dismiss}
    >
      <Formik
        initialValues={{
          name: originalSubnet.identity.name,
          description: originalSubnet.identity.description,
          ipv4Block: originalSubnet.ipv4_block || '',
          ipv6Block: originalSubnet.ipv6_block || '',
        }}
        onSubmit={({ name, description, ipv4Block, ipv6Block }) => {
          updateSubnet.mutate({
            ...parentIds,
            subnetName: originalSubnet.identity.name,
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
        <CommonForm id={formId} error={updateSubnet.error} />
      </Formik>
      <SideModal.Footer>
        <Button variant="dim" className="mr-2.5" onClick={dismiss}>
          Cancel
        </Button>
        <Button form={formId} type="submit">
          Update subnet
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
