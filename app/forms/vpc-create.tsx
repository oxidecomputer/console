import { useNavigate } from 'react-router-dom'

import type { VpcCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import {
  DescriptionField,
  NameField,
  SideModalForm,
  TextField,
} from 'app/components/hook-form'
import { useRequiredParams, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const defaultValues: VpcCreate = {
  name: '',
  description: '',
  dnsName: '',
}

export function CreateVpcSideModalForm() {
  const parentNames = useRequiredParams('orgName', 'projectName')
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const createVpc = useApiMutation('vpcCreate', {
    onSuccess(vpc) {
      const vpcParams = { ...parentNames, vpcName: vpc.name }
      queryClient.invalidateQueries('vpcList', { path: parentNames })
      // avoid the vpc fetch when the vpc page loads since we have the data
      queryClient.setQueryData('vpcView', { path: vpcParams }, vpc)
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your VPC has been created.',
      })
      navigate(pb.vpc(vpcParams))
    },
  })

  return (
    <SideModalForm
      id="create-vpc-form"
      title="Create VPC"
      formOptions={{ defaultValues }}
      onSubmit={(values) => createVpc.mutate({ path: parentNames, body: values })}
      onDismiss={() => navigate(pb.vpcs(parentNames))}
      submitDisabled={createVpc.isLoading}
      error={createVpc.error?.error as Error | undefined}
    >
      {(control) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <NameField name="dnsName" label="DNS name" control={control} />
          <TextField name="ipv6Prefix" label="IPV6 prefix" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
