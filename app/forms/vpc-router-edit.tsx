import type { VpcRouter } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { pick } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useVpcSelector } from 'app/hooks'

type EditVpcRouterFormProps = {
  onDismiss: () => void
  editing: VpcRouter
}

export function EditVpcRouterForm({ onDismiss, editing }: EditVpcRouterFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const updateRouter = useApiMutation('vpcRouterUpdateV1', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterListV1', { query: vpcSelector })
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
          path: { router: editing.name },
          query: vpcSelector,
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
