import invariant from 'tiny-invariant'

import type { VpcRouter, VpcRouterUpdate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

import type { EditSideModalFormProps } from '.'

export function EditVpcRouterForm({
  id = 'edit-vpc-router-form',
  title = 'Edit VPC router',
  onSuccess,
  onError,
  onDismiss,
  ...props
}: EditSideModalFormProps<VpcRouterUpdate, VpcRouter>) {
  const parentNames = useRequiredParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateRouter = useApiMutation('vpcRouterUpdate', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcRouterList', { path: parentNames })
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
          path: { ...parentNames, routerName: props.initialValues.name },
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
