import type { VpcRouterCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useToast, useVpcSelector } from 'app/hooks'

const defaultValues: VpcRouterCreate = {
  name: '',
  description: '',
}

type CreateVpcRouterFormProps = {
  onDismiss: () => void
}

export function CreateVpcRouterForm({ onDismiss }: CreateVpcRouterFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createRouter = useApiMutation('vpcRouterCreate', {
    onSuccess(router) {
      queryClient.invalidateQueries('vpcRouterList', { query: vpcSelector })
      // avoid the vpc fetch when the vpc page loads since we have the data
      queryClient.setQueryData(
        'vpcRouterView',
        { path: { router: router.name }, query: vpcSelector },
        router
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your VPC router has been created.',
      })
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="create-vpc-router-form"
      title="Create VPC Router"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) =>
        createRouter.mutate({ query: vpcSelector, body: { name, description } })
      }
      loading={createRouter.isLoading}
      submitError={createRouter.error}
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
