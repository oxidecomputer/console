import React from 'react'
import { Form, NameField, DescriptionField, TextField } from '@oxide/form'
import type { Vpc } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useParams, useToast } from 'app/hooks'
import { Success16Icon } from '@oxide/ui'
import type { PrebuiltFormProps } from 'app/forms'

const values = {
  name: '',
  description: '',
  dnsName: '',
  ipv6Prefix: '',
}

export function CreateVpcForm({
  id = 'create-vpc-form',
  title = 'Create VPC',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<typeof values, Vpc>) {
  const parentNames = useParams('orgName', 'projectName')
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createVpc = useApiMutation('projectVpcsPost', {
    onSuccess(vpc) {
      queryClient.invalidateQueries('projectVpcsGet', parentNames)
      // avoid the vpc fetch when the vpc page loads since we have the data
      queryClient.setQueryData(
        'projectVpcsGetVpc',
        { ...parentNames, vpcName: vpc.name },
        vpc
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your VPC has been created.',
        timeout: 5000,
      })
      onSuccess?.(vpc)
    },
    onError,
  })

  return (
    <Form
      id={id}
      title={title}
      initialValues={initialValues}
      onSubmit={
        onSubmit ??
        (({ name, description, dnsName, ipv6Prefix }) =>
          createVpc.mutate({
            ...parentNames,
            body: { name, description, dnsName, ipv6Prefix },
          }))
      }
      mutation={createVpc}
      {...props}
    >
      <NameField id="vpc-name" />
      <DescriptionField id="vpc-description" />
      <TextField id="vpc-dns-name" name="dnsName" label="DNS name" />
      <TextField id="vpc-ipv6-prefix" name="ipv6Prefix" label="IPV6 prefix" />
      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default CreateVpcForm
