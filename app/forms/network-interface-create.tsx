import invariant from 'tiny-invariant'

import type { NetworkInterface, NetworkInterfaceCreate } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { nullIfEmpty, useApiMutation, useApiQueryClient } from '@oxide/api'
import { Divider } from '@oxide/ui'

import {
  DescriptionField,
  ListboxField,
  NameField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import { SubnetListbox } from 'app/components/form/fields/SubnetListbox'
import type { CreateSideModalFormProps } from 'app/forms'
import { useParams } from 'app/hooks'

const values: NetworkInterfaceCreate = {
  name: '',
  description: '',
  ip: '',
  subnetName: '',
  vpcName: '',
}

export default function CreateNetworkInterfaceSideModalForm({
  id = 'create-network-interface-form',
  title = 'Add network interface',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSideModalFormProps<NetworkInterfaceCreate, NetworkInterface>) {
  const queryClient = useApiQueryClient()
  const pathParams = useParams('orgName', 'projectName')

  const createNetworkInterface = useApiMutation('instanceNetworkInterfacesPost', {
    onSuccess(data) {
      const { instanceName, ...others } = pathParams
      invariant(instanceName, 'instanceName is required when posting a network interface')
      queryClient.invalidateQueries('instanceNetworkInterfacesGet', {
        instanceName,
        ...others,
      })
      onSuccess?.(data)
      onDismiss()
    },
    onError,
  })

  const vpcs = useApiQuery('projectVpcsGet', { ...pathParams, limit: 50 }).data?.items || []

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={initialValues}
      onDismiss={onDismiss}
      onSubmit={
        onSubmit ||
        ((body) => {
          const { instanceName, ...others } = pathParams
          invariant(
            instanceName,
            'instanceName is required when posting a network interface'
          )

          createNetworkInterface.mutate({
            instanceName,
            ...others,
            body: { ...body, ip: nullIfEmpty(body.ip) },
          })
        })
      }
      submitDisabled={createNetworkInterface.isLoading}
      error={createNetworkInterface.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="nic-name" />
      <DescriptionField id="nic-description" />
      <Divider />

      <ListboxField
        id="nic-vpc"
        name="vpcName"
        label="VPC"
        items={vpcs.map(({ name }) => ({ label: name, value: name }))}
        required
      />
      <SubnetListbox
        id="nic-subnet"
        name="subnetName"
        label="Subnet"
        vpcNameField="vpcName"
        vpcs={vpcs}
        required
      />
      <TextField id="nic-ip" name="ip" label="IP Address" />
    </SideModalForm>
  )
}
