import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { apiQueryClient, useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/hook-form'
import { requireVpcParams, useToast, useVpcParams } from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditVpcSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('vpcView', {
    path: requireVpcParams(params),
  })
}

export function EditVpcSideModalForm() {
  const vpcParams = useVpcParams()
  const parentNames = { orgName: vpcParams.orgName, projectName: vpcParams.projectName }
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const { data: vpc } = useApiQuery('vpcView', { path: vpcParams })

  const onDismiss = () => navigate(pb.vpcs(parentNames))

  const editVpc = useApiMutation('vpcUpdate', {
    async onSuccess(vpc) {
      queryClient.invalidateQueries('vpcList', { path: parentNames })
      queryClient.setQueryData(
        'vpcView',
        { path: { ...parentNames, vpcName: vpc.name } },
        vpc
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your VPC has been created.',
      })
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="edit-vpc-form"
      title="Edit VPC"
      formOptions={{ defaultValues: vpc }}
      onDismiss={onDismiss}
      onSubmit={({ name, description, dnsName }) => {
        editVpc.mutate({
          path: vpcParams,
          body: { name, description, dnsName },
        })
      }}
      submitDisabled={editVpc.isLoading}
      submitLabel="Save changes"
      submitError={editVpc.error}
    >
      {(control) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <NameField name="dnsName" label="DNS name" required={false} control={control} />
        </>
      )}
    </SideModalForm>
  )
}
