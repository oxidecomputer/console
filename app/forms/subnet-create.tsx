import { DescriptionField, Form, NameField, TextField } from '@oxide/form'
import { Divider } from '@oxide/ui'
import React from 'react'
import type { PrebuiltFormProps } from '@oxide/form'
import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { invariant } from '@oxide/util'

const values = {
  name: '',
  description: '',
  ipv4Block: '',
  ipv6Block: '',
}

export function CreateSubnetForm({
  id = 'create-subnet-form',
  title = 'Create subnet',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<
  typeof values,
  VpcSubnet,
  'orgName' | 'projectName' | 'vpcName'
>) {
  const queryClient = useApiQueryClient()

  const createSubnet = useApiMutation('vpcSubnetsPost', {
    onSuccess(data, { body: _, ...params }) {
      queryClient.invalidateQueries('vpcSubnetsGet', params)
      onSuccess?.(data, params)
    },
    onError,
  })
  return (
    <Form
      id={id}
      title={title}
      initialValues={initialValues}
      onSubmit={
        onSubmit ||
        (({ orgName, projectName, vpcName, ...body }) => {
          invariant(
            orgName && projectName && vpcName,
            'subnet-create form is missing a path param'
          )
          createSubnet.mutate({ orgName, projectName, vpcName, body })
        })
      }
      mutation={createSubnet}
      {...props}
    >
      <NameField id="subnet-name" />
      <DescriptionField id="subnet-description" />
      <Divider />
      <TextField id="subnet-ipv4-block" name="ipv4Block" label="IPv4 block" />
      <TextField id="subnet-ipv6-block" name="ipv6Block" label="IPv6 block" />
      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default CreateSubnetForm
