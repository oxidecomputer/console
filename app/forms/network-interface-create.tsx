import React from 'react'
import { DescriptionField, Form, NameField, TextField } from 'app/components/form'
import { Divider } from '@oxide/ui'
import type { NetworkInterfaceCreate, NetworkInterface } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import type { PrebuiltFormProps } from 'app/forms'
import { useParams } from 'app/hooks'
import invariant from 'tiny-invariant'

const values: NetworkInterfaceCreate = {
  name: '',
  description: '',
  ip: '',
  subnetName: '',
  vpcName: '',
}

export default function CreateNetworkInterfaceForm({
  id = 'create-network-interface-form',
  title = 'Add Network Interface',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<NetworkInterfaceCreate, NetworkInterface>) {
  const queryClient = useApiQueryClient()
  const pathParams = useParams('orgName', 'projectName')

  const createNetworkInterface = useApiMutation('instanceNetworkInterfacesPost', {
    onSuccess(data) {
      const { instanceName, ...others } = pathParams
      invariant(instanceName, 'instanceName is required when posting a network interface')
      queryClient.invalidateQueries('instanceNetworkInterfacesGet', {
        instanceName,
        ...others,
      })
      onSuccess?.(data)
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
        ((body) => {
          const { instanceName, ...others } = pathParams
          invariant(
            instanceName,
            'instanceName is required when posting a network interface'
          )
          createNetworkInterface.mutate({ instanceName, ...others, body })
        })
      }
      mutation={createNetworkInterface}
      {...props}
    >
      <NameField id="nic-name" />
      <DescriptionField id="nic-description" />
      <Divider />

      {/* TODO: Convert these into combo boxes */}
      <TextField id="nic-vpc" name="vpcName" label="VPC" required />
      <TextField id="nic-subnet" name="subnetName" label="Subnet" required />
      <TextField id="nic-ip" name="ip" label="IP Address" />

      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}
