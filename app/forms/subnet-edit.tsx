import type { SetRequired } from 'type-fest'

import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Divider } from '@oxide/ui'

import { DescriptionField, Form, NameField } from 'app/components/form'
import type { PrebuiltFormProps } from 'app/forms'
import { useParams } from 'app/hooks'

import type { VpcSubnetFieldValues } from './subnet-create'

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
      onSubmit={({ name, description }) => {
        updateSubnet.mutate({
          ...parentNames,
          subnetName: props.initialValues.name,
          body: {
            name,
            description,
          },
        })
      }}
      mutation={updateSubnet}
      {...props}
    >
      <NameField id="subnet-name" />
      <DescriptionField id="subnet-description" />
      <Divider />
      <Form.Actions>
        <Form.Submit>Update subnet</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default EditSubnetForm
