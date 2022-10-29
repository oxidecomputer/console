import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { pick } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/hook-form'
import { useRequiredParams } from 'app/hooks'

type EditSubnetFormProps = {
  onDismiss: () => void
  editing: VpcSubnet
}

export function EditSubnetForm({ onDismiss, editing }: EditSubnetFormProps) {
  const parentNames = useRequiredParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateSubnet = useApiMutation('vpcSubnetUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList', { path: parentNames })
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
          path: { ...parentNames, subnetName: editing.name },
          body,
        })
      }}
      submitDisabled={updateSubnet.isLoading}
      submitError={updateSubnet.error}
      submitLabel="Update subnet"
    >
      {(control) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
