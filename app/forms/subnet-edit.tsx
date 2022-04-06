import React from 'react'
import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { invariant } from '@oxide/util'

import { CreateSubnetForm } from './subnet-create'
import type { ExtendedPrebuiltFormProps } from 'app/forms'

import type { params } from './subnet-create'
export { params } from './subnet-create'

export function EditSubnetForm({
  id = 'edit-subnet-form',
  title = 'Edit subnet',
  onSubmit,
  onSuccess,
  onError,
  ...props
}: ExtendedPrebuiltFormProps<
  typeof CreateSubnetForm,
  VpcSubnet,
  typeof params
>) {
  const queryClient = useApiQueryClient()

  const updateSubnet = useApiMutation('vpcSubnetsPutSubnet', {
    onSuccess(data, { body: _, ...params }) {
      queryClient.invalidateQueries('vpcSubnetsGet', params)
      onSuccess?.(data, params)
    },
    onError,
  })

  return (
    <CreateSubnetForm
      id={id}
      title={title}
      onSubmit={
        onSubmit ||
        (({
          name,
          description,
          ipv4Block,
          ipv6Block,
          orgName,
          projectName,
          vpcName,
        }) => {
          invariant(
            orgName && projectName && vpcName,
            'subnet-edit form is missing a path param'
          )
          invariant(
            props.initialValues?.name,
            'CreateSubnetForm should always receive a name for initialValues'
          )
          updateSubnet.mutate({
            orgName,
            projectName,
            vpcName,
            subnetName: props.initialValues.name,
            body: {
              name,
              description,
              // TODO: validate these client-side using the patterns. sadly non-trivial
              ipv4Block: ipv4Block || null,
              ipv6Block: ipv6Block || null,
            },
          })
        })
      }
      mutation={updateSubnet}
      {...props}
    />
  )
}

export default EditSubnetForm
