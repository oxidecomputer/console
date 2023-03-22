import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { pick } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useVpcSelector } from 'app/hooks'

type EditSubnetFormProps = {
  onDismiss: () => void
  editing: VpcSubnet
}

export function EditSubnetForm({ onDismiss, editing }: EditSubnetFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const updateSubnet = useApiMutation('vpcSubnetUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList', { query: vpcSelector })
      onDismiss()
    },
  })

  const defaultValues = pick(editing, 'name', 'description') /* satisfies VpcSubnetUpdate */

  return (
    <SideModalForm
      id="edit-subnet-form"
      title="Edit subnet"
      onDismiss={onDismiss}
      formOptions={{ defaultValues }}
      onSubmit={(body) => {
        updateSubnet.mutate({
          path: { subnet: editing.name },
          query: vpcSelector,
          body,
        })
      }}
      loading={updateSubnet.isLoading}
      submitError={updateSubnet.error}
      submitLabel="Update subnet"
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
