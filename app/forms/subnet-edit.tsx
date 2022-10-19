import invariant from 'tiny-invariant'

import type { VpcSubnet, VpcSubnetUpdate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Divider } from '@oxide/ui'

import { DescriptionField, Form, NameField, SideModalForm } from 'app/components/form'
import type { EditSideModalFormProps } from 'app/forms'
import { useRequiredParams } from 'app/hooks'

export function EditSubnetSideModalForm({
  id = 'edit-subnet-form',
  title = 'Edit subnet',
  onSuccess,
  onError,
  onDismiss,
  ...props
}: EditSideModalFormProps<VpcSubnetUpdate, VpcSubnet>) {
  const parentNames = useRequiredParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateSubnet = useApiMutation('vpcSubnetUpdate', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcSubnetList', { path: parentNames })
      onSuccess?.(data)
      onDismiss()
    },
    onError,
  })

  return (
    <SideModalForm
      id={id}
      title={title}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        invariant(
          props.initialValues.name,
          'Tried to edit a subnet without providing an initial name'
        )
        updateSubnet.mutate({
          path: {
            ...parentNames,
            subnetName: props.initialValues.name,
          },
          body: {
            name,
            description,
          },
        })
      }}
      submitDisabled={updateSubnet.isLoading}
      error={updateSubnet.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="subnet-name" />
      <DescriptionField id="subnet-description" />
      <Divider />
      <Form.Submit>Update subnet</Form.Submit>
    </SideModalForm>
  )
}

export default EditSubnetSideModalForm
