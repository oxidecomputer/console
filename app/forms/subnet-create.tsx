import type { VpcSubnet, VpcSubnetCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Divider } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

import type { CreateSideModalFormProps } from '.'

const values: VpcSubnetCreate = {
  name: '',
  description: '',
  ipv4Block: '',
}

export function CreateSubnetSideModalForm({
  id = 'create-subnet-form',
  title = 'Create subnet',
  initialValues = values,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSideModalFormProps<VpcSubnetCreate, VpcSubnet>) {
  const parentNames = useRequiredParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const createSubnet = useApiMutation('vpcSubnetCreate', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcSubnetList', parentNames)
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
      <TextField id="subnet-ipv4-block" name="ipv4Block" label="IPv4 block" required />
      <TextField id="subnet-ipv6-block" name="ipv6Block" label="IPv6 block" />
    </SideModalForm>
  )
}

export default CreateSubnetSideModalForm
