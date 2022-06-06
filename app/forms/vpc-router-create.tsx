import { NameField, DescriptionField, SideModalForm } from 'app/components/form'
import type { VpcRouter, VpcRouterCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useParams, useToast } from 'app/hooks'
import type { SideModalProps } from '@oxide/ui'
import { Success16Icon } from '@oxide/ui'
import type { CreateFormProps } from 'app/forms'

const values = {
  name: '',
  description: '',
}

type CreateVpcRouterSideModalFormProps = CreateFormProps<VpcRouterCreate, VpcRouter> &
  Omit<SideModalProps, 'id'>

export function CreateVpcRouterForm({
  id = 'create-vpc-router-form',
  title = 'Create VPC Router',
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateVpcRouterSideModalFormProps) {
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
        createRouter.mutate({ ...parentNames, body: { name, description } })
      }
      {...props}
    >
      <NameField id="router-name" />
      <DescriptionField id="router-description" />
    </SideModalForm>
  )
}
