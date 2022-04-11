import React from 'react'
import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import invariant from 'tiny-invariant'

import { CreateSubnetForm } from './subnet-create'
import { useParams } from 'app/hooks'
import type { ExtendedPrebuiltFormProps } from 'app/forms'

export function EditSubnetForm({
  id = 'edit-subnet-form',
  title = 'Edit subnet',
  onSubmit,
  onSuccess,
  onError,
  ...props
}: ExtendedPrebuiltFormProps<typeof CreateSubnetForm, VpcSubnet>) {
  const parentNames = useParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateSubnet = useApiMutation('vpcSubnetsPutSubnet', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcSubnetsGet', parentNames)
      onSuccess?.(data)
    },
    onError,
  })

  return (
    <CreateSubnetForm
      id={id}
      title={title}
      onSubmit={
        onSubmit ||
        (({ name, description, ipv4Block, ipv6Block }) => {
          invariant(
            props.initialValues?.name,
            'CreateSubnetForm should always receive a name for initialValues'
          )
          updateSubnet.mutate({
            ...parentNames,
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
