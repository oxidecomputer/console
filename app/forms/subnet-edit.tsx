import type { SetRequired } from 'type-fest'
import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import type { VpcSubnetFieldValues } from './subnet-create'
import { VpcSubnetFields } from './subnet-create'
import { useParams } from 'app/hooks'
import type { PrebuiltFormProps } from 'app/forms'
import { Form } from 'app/components/form'

export function EditSubnetForm({
  id = 'edit-subnet-form',
  title = 'Edit subnet',
  onSuccess,
  onError,
  ...props
}: SetRequired<PrebuiltFormProps<VpcSubnetFieldValues, VpcSubnet>, 'initialValues'>) {
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
    <Form
      id={id}
      title={title}
      onSubmit={({ name, description, ipv4Block, ipv6Block }) => {
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
      }}
      mutation={updateSubnet}
      {...props}
    >
      <VpcSubnetFields submitLabel={title} />
    </Form>
  )
}

export default EditSubnetForm
