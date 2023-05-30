import { useForm } from 'react-hook-form'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import { toPathQuery } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { getVpcSelector, useToast, useVpcSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditVpcSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('vpcView', toPathQuery('vpc', getVpcSelector(params)))
  return null
}

export function EditVpcSideModalForm() {
  const vpcSelector = useVpcSelector()
  const vpcPathQuery = toPathQuery('vpc', vpcSelector)
  const projectSelector = { project: vpcSelector.project }
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const { data: vpc } = useApiQuery('vpcView', vpcPathQuery)

  const onDismiss = () => navigate(pb.vpcs(projectSelector))

  const editVpc = useApiMutation('vpcUpdate', {
    async onSuccess(vpc) {
      queryClient.invalidateQueries('vpcList', { query: projectSelector })
      queryClient.setQueryData(
        'vpcView',
        { path: { vpc: vpc.name }, query: projectSelector },
        vpc
      )
      addToast({
        content: 'Your VPC has been created',
      })
      onDismiss()
    },
  })

  const form = useForm({ mode: 'all', defaultValues: vpc })

  return (
    <SideModalForm
      id="edit-vpc-form"
      title="Edit VPC"
      form={form}
      onDismiss={onDismiss}
      onSubmit={({ name, description, dnsName }) => {
        editVpc.mutate({
          ...vpcPathQuery,
          body: { name, description, dnsName },
        })
      }}
      loading={editVpc.isLoading}
      submitLabel="Save changes"
      submitError={editVpc.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <NameField name="dnsName" label="DNS name" required={false} control={form.control} />
    </SideModalForm>
  )
}
