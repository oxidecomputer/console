import invariant from 'tiny-invariant'

import type { VpcRouter, VpcRouterUpdate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { SideModalProps } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import type { EditFormProps } from 'app/forms'
import { useParams } from 'app/hooks'

type EditVpcRouterSideModalFormProps = Omit<SideModalProps, 'id'> &
  EditFormProps<VpcRouterUpdate, VpcRouter>

export function EditVpcRouterForm({
  id = 'edit-vpc-router-form',
  title = 'Edit VPC router',
  onSuccess,
  onError,
  onDismiss,
  ...props
}: EditVpcRouterSideModalFormProps) {
  const parentNames = useParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateRouter = useApiMutation('vpcRoutersPutRouter', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcRoutersGet', parentNames)
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
          'Expected initial name to be passed to update router'
        )
        updateRouter.mutate({
          ...parentNames,
          routerName: props.initialValues.name,
          body: { name, description },
        })
      }}
      submitDisabled={updateRouter.isLoading}
      error={updateRouter.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="router-name" />
      <DescriptionField id="router-description" />
    </SideModalForm>
  )
}
