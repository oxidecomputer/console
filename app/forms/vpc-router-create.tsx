import type { VpcRouter, VpcRouterCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import type { CreateSideModalFormProps } from 'app/forms'
import { useRequiredParams, useToast } from 'app/hooks'

const values = {
  name: '',
  description: '',
}

export function CreateVpcRouterForm({
  id = 'create-vpc-router-form',
  title = 'Create VPC Router',
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSideModalFormProps<VpcRouterCreate, VpcRouter>) {
  const parentNames = useRequiredParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createRouter = useApiMutation('vpcRouterCreate', {
    onSuccess(router) {
      queryClient.invalidateQueries('vpcRouterList', { path: parentNames })
      // avoid the vpc fetch when the vpc page loads since we have the data
      queryClient.setQueryData(
        'vpcRouterView',
        { path: { ...parentNames, routerName: router.name } },
        router
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your VPC router has been created.',
      })
      onSuccess?.(router)
      onDismiss()
    },
    onError,
  })

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={values}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) =>
        createRouter.mutate({ path: parentNames, body: { name, description } })
      }
      submitDisabled={createRouter.isLoading}
      error={createRouter.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="router-name" />
      <DescriptionField id="router-description" />
    </SideModalForm>
  )
}
