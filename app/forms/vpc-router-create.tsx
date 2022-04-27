import { Form, NameField, DescriptionField } from 'app/components/form'
import type { VpcRouter } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useParams, useToast } from 'app/hooks'
import { Success16Icon } from '@oxide/ui'
import type { PrebuiltFormProps } from 'app/forms'

const values = {
  name: '',
  description: '',
}

export function CreateVpcRouterForm({
  id = 'create-vpc-router-form',
  title = 'Create VPC router',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<typeof values, VpcRouter>) {
  const parentNames = useParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createRouter = useApiMutation('vpcRoutersPost', {
    onSuccess(router) {
      queryClient.invalidateQueries('vpcRoutersGet', parentNames)
      // avoid the vpc fetch when the vpc page loads since we have the data
      queryClient.setQueryData(
        'vpcRoutersGetRouter',
        { ...parentNames, routerName: router.name },
        router
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your VPC router has been created.',
        timeout: 5000,
      })
      onSuccess?.(router)
    },
    onError,
  })

  return (
    <Form
      id={id}
      title={title}
      initialValues={initialValues}
      onSubmit={
        onSubmit ??
        (({ name, description }) =>
          createRouter.mutate({ ...parentNames, body: { name, description } }))
      }
      mutation={createRouter}
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
