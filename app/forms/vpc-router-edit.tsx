import type { VpcRouter } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { pick } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

type EditVpcRouterFormProps = {
  onDismiss: () => void
  editing: VpcRouter
}

export function EditVpcRouterForm({ onDismiss, editing }: EditVpcRouterFormProps) {
  const parentNames = useRequiredParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateRouter = useApiMutation('vpcRouterUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterList', { path: parentNames })
      onDismiss()
    },
  })

  const defaultValues = pick(editing, 'name', 'description') /* satisfies VpcRouterUpdate */

  return (
    <SideModalForm
      id="edit-vpc-router-form"
      title="Edit VPC router"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        updateRouter.mutate({
          path: { ...parentNames, routerName: editing.name },
          body: { name, description },
        })
      }}
      loading={updateRouter.isLoading}
      submitError={updateRouter.error}
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
