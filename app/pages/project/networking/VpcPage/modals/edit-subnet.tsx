import React from 'react'
import { Formik, Form } from 'formik'

import { Button, FieldTitle, SideModal, TextField } from '@oxide/ui'
import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

type Props = {
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
}: Props) {
  const parentIds = {
    organizationName: orgName,
    projectName,
    vpcName,
  }
  const queryClient = useApiQueryClient()
  const updateSubnet = useApiMutation('vpcSubnetsPutSubnet', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetsGet', parentIds)
      onDismiss()
    },
  })

  if (!originalSubnet) return null

  const formId = 'edit-vpc-subnet-form'
  return (
    <SideModal
      id="edit-vpc-subnet-modal"
      title="Edit subnet"
      onDismiss={onDismiss}
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
        </Form>
      </Formik>
      <SideModal.Footer>
        <Button variant="dim" className="mr-2.5" onClick={onDismiss}>
          Cancel
        </Button>
        <Button form={formId} type="submit">
          Update subnet
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
