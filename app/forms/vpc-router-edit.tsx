import type { SetRequired } from 'type-fest'

import type { VpcRouter } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import type { VpcRouterFieldValues } from './vpc-router-create'
import { useParams } from 'app/hooks'
import { DescriptionField, Form, NameField } from 'app/components/form'
import type { CreateFormProps } from 'app/forms'

export function EditVpcRouterForm({
  title = 'Edit VPC router',
  onSuccess,
  onError,
  ...props
}: SetRequired<CreateFormProps<VpcRouterFieldValues, VpcRouter>, 'initialValues'>) {
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
    <Form
      id="edit-vpc-router-form"
      title={title}
      onSubmit={({ name, description }) => {
        updateRouter.mutate({
          ...parentNames,
          routerName: props.initialValues.name,
          body: { name, description },
        })
      }}
      mutation={updateRouter}
      {...props}
    >
      <NameField id="router-name" />
      <DescriptionField id="router-description" />
      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}
