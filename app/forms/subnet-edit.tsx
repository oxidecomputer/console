import invariant from 'tiny-invariant'

import type { VpcSubnet, VpcSubnetUpdate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { SideModalProps } from '@oxide/ui'
import { Divider } from '@oxide/ui'

import { DescriptionField, Form, NameField, SideModalForm } from 'app/components/form'
import type { EditFormProps } from 'app/forms'
import { useParams } from 'app/hooks'

type EditSubnetSideModalFormProps = Omit<SideModalProps, 'id'> &
  EditFormProps<VpcSubnetUpdate, VpcSubnet>

export function EditSubnetSideModalForm({
  id = 'edit-subnet-form',
  title = 'Edit subnet',
  onSuccess,
  onError,
  onDismiss,
  ...props
}: EditSubnetSideModalFormProps) {
  const parentNames = useParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateSubnet = useApiMutation('vpcSubnetsPutSubnet', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcSubnetsGet', parentNames)
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
          ...parentNames,
          subnetName: props.initialValues.name,
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
