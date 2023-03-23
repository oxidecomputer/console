import type { VpcSubnetCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Divider } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import { useVpcSelector } from 'app/hooks'

const defaultValues: VpcSubnetCreate = {
  name: '',
  description: '',
  ipv4Block: '',
}

type CreateSubnetFormProps = {
  onDismiss: () => void
}

export function CreateSubnetForm({ onDismiss }: CreateSubnetFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const createSubnet = useApiMutation('vpcSubnetCreate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList', { query: vpcSelector })
      onDismiss()
    },
  })
  return (
    <SideModalForm
      id="create-subnet-form"
      title="Create subnet"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={(body) => createSubnet.mutate({ query: vpcSelector, body })}
      loading={createSubnet.isLoading}
      submitError={createSubnet.error}
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <Divider />
          <TextField name="ipv4Block" label="IPv4 block" required control={control} />
          <TextField name="ipv6Block" label="IPv6 block" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
