import type { VpcRouter } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import invariant from 'tiny-invariant'

import { CreateVpcRouterForm } from './vpc-router-create'
import { useParams } from 'app/hooks'
import type { ExtendedPrebuiltFormProps } from 'app/forms'

export function EditVpcRouterForm({
  id = 'edit-vpc-router-form',
  title = 'Edit VPC router',
  onSubmit,
  onSuccess,
  onError,
  ...props
}: ExtendedPrebuiltFormProps<typeof CreateVpcRouterForm, VpcRouter>) {
  const parentNames = useParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateRouter = useApiMutation('vpcRoutersPutRouter', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcRoutersGet', parentNames)
      onSuccess?.(data)
    },
    onError,
  })

  return (
    <CreateVpcRouterForm
      id={id}
      title={title}
      onSubmit={
        onSubmit ||
        (({ name, description }) => {
          invariant(
            props.initialValues?.name,
            'CreateVpcRouterForm should always receive a name for initialValues'
          )
          updateRouter.mutate({
            ...parentNames,
            routerName: props.initialValues.name,
            body: { name, description },
          })
        })
      }
      mutation={updateRouter}
      {...props}
    />
  )
}
