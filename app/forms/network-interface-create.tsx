import invariant from 'tiny-invariant'

import type { NetworkInterface, NetworkInterfaceCreate } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
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
import { useAllParams } from 'app/hooks'

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
  const { orgName, projectName, instanceName } = useAllParams('orgName', 'projectName')

  const createNetworkInterface = useApiMutation('instanceNetworkInterfaceCreate', {
    onSuccess(data) {
      invariant(instanceName, 'instanceName is required when posting a network interface')
      queryClient.invalidateQueries('instanceNetworkInterfaceList', {
        path: { instanceName, projectName, orgName },
      })
      onSuccess?.(data)
      onDismiss()
    },
    onError,
  })

  const vpcs = useApiQuery('vpcList', { path: { orgName, projectName } }).data?.items || []

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={initialValues}
      onDismiss={onDismiss}
      onSubmit={
        onSubmit ||
        ((body) => {
          invariant(
            instanceName,
            'instanceName is required when posting a network interface'
          )

          createNetworkInterface.mutate({
            path: { instanceName, projectName, orgName },
            body: { ...body },
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
