import {
  DescriptionField,
  Form,
  NameField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import type { SideModalProps } from '@oxide/ui'
import { Divider } from '@oxide/ui'

import type { VpcSubnet, VpcSubnetCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useParams } from 'app/hooks'
import type { CreateFormProps } from 'app/forms'

const values = {
  name: '',
  description: '',
  ipv4Block: '',
  ipv6Block: '',
}

type CreateSubnetSideModalFormProps = Omit<SideModalProps, 'id'> &
  CreateFormProps<VpcSubnetCreate, VpcSubnet>

export function CreateSubnetSideModalForm({
  id = 'create-subnet-form',
  title = 'Create subnet',
  initialValues = values,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSubnetSideModalFormProps) {
  const parentNames = useParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const createSubnet = useApiMutation('vpcSubnetsPost', {
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
      initialValues={initialValues}
      onDismiss={onDismiss}
      onSubmit={(body) => createSubnet.mutate({ ...parentNames, body })}
      submitDisabled={createSubnet.isLoading}
      error={createSubnet.error?.error as Error | undefined}
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
    </SideModalForm>
  )
}

export default CreateSubnetSideModalForm
