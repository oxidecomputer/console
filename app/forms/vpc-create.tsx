import { useNavigate } from 'react-router-dom'

import type { VpcCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { toPathQuery } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import { useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const defaultValues: VpcCreate = {
  name: '',
  description: '',
  dnsName: '',
}

export function CreateVpcSideModalForm() {
  const projectSelector = useProjectSelector()
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const createVpc = useApiMutation('vpcCreate', {
    onSuccess(vpc) {
      const vpcSelector = { ...projectSelector, vpc: vpc.name }
      queryClient.invalidateQueries('vpcList', { query: projectSelector })
      // avoid the vpc fetch when the vpc page loads since we have the data
      queryClient.setQueryData('vpcView', toPathQuery('vpc', vpcSelector), vpc)
      addToast({
        content: 'Your VPC has been created',
      })
      navigate(pb.vpc(vpcSelector))
    },
  })

  return (
    <SideModalForm
      id="create-vpc-form"
      title="Create VPC"
      formOptions={{ defaultValues }}
      onSubmit={(values) => createVpc.mutate({ query: projectSelector, body: values })}
      onDismiss={() => navigate(pb.vpcs(projectSelector))}
      loading={createVpc.isLoading}
      submitError={createVpc.error}
    >
      {({ control }) => (
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
