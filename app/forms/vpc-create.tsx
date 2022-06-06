import { NameField, DescriptionField, TextField, SideModalForm } from 'app/components/form'
import type { Vpc, VpcCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useParams, useToast } from 'app/hooks'
import type { SideModalProps } from '@oxide/ui'
import { Success16Icon } from '@oxide/ui'
import type { CreateFormProps } from 'app/forms'

const values = {
  name: '',
  description: '',
  dnsName: '',
  ipv6Prefix: '',
}

type CreateVPCSideModalFormProps = Omit<SideModalProps, 'id'> &
  CreateFormProps<VpcCreate, Vpc>

export function CreateVpcSideModalForm({
  id = 'create-vpc-form',
  title = 'Create VPC',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: CreateVPCSideModalFormProps) {
  const parentNames = useParams('orgName', 'projectName')
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createVpc = useApiMutation('projectVpcsPost', {
    onSuccess(vpc) {
      queryClient.invalidateQueries('projectVpcsGet', parentNames)
      // avoid the vpc fetch when the vpc page loads since we have the data
      queryClient.setQueryData(
        'projectVpcsGetVpc',
        { ...parentNames, vpcName: vpc.name },
        vpc
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your VPC has been created.',
        timeout: 5000,
      })
      onSuccess?.(vpc)
    },
    onError,
  })

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={initialValues}
      onSubmit={
        onSubmit ??
        (({ name, description, dnsName, ipv6Prefix }) =>
          createVpc.mutate({
            ...parentNames,
            body: { name, description, dnsName, ipv6Prefix },
          }))
      }
      {...props}
    >
      <NameField id="vpc-name" />
      <DescriptionField id="vpc-description" />
      <NameField id="vpc-dns-name" name="dnsName" label="DNS name" required={false} />
      <TextField id="vpc-ipv6-prefix" name="ipv6Prefix" label="IPV6 prefix" />
    </SideModalForm>
  )
}

export default CreateVpcSideModalForm
