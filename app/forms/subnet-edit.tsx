import type { SetRequired } from 'type-fest'
import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import type { VpcSubnetFieldValues } from './subnet-create'
import { useParams } from 'app/hooks'
import type { PrebuiltFormProps } from 'app/forms'
import { DescriptionField, Form, NameField } from 'app/components/form'
import { Divider } from '@oxide/ui'

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
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default EditSubnetForm
