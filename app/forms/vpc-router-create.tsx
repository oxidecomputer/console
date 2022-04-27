import type { ReactNode } from 'react'
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

export type VpcRouterFieldValues = typeof values

export function VpcRouterFields({ submitLabel }: { submitLabel: ReactNode }) {
  return (
    <>
      <NameField id="router-name" />
      <DescriptionField id="router-description" />
      <Form.Actions>
        <Form.Submit>{submitLabel}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </>
  )
}

export function CreateVpcRouterForm({
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<VpcRouterFieldValues, VpcRouter>) {
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
        content: 'Your VPC has been created.',
        timeout: 5000,
      })
      onSuccess?.(router)
    },
    onError,
  })

  const title = 'Create VPC router'

  return (
    <Form
      id="create-vpc-router-form"
      title={title}
      initialValues={values}
      onSubmit={({ name, description }) =>
        createRouter.mutate({ ...parentNames, body: { name, description } })
      }
      mutation={createRouter}
      {...props}
    >
      <VpcRouterFields submitLabel={title} />
    </Form>
  )
}
