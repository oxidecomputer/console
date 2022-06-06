import {
  ComboboxField,
  DescriptionField,
  NameField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import type { SideModalProps } from '@oxide/ui'
import { Divider } from '@oxide/ui'
import type { NetworkInterface, NetworkInterfaceCreate } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { nullIfEmpty, useApiMutation, useApiQueryClient } from '@oxide/api'

import type { CreateFormProps } from 'app/forms'
import { useParams } from 'app/hooks'
import invariant from 'tiny-invariant'
import { SubnetCombobox } from 'app/components/form/fields/SubnetCombobox'

const values = {
  name: '',
  description: '',
  ip: '',
  subnetName: '',
  vpcName: '',
}

type CreateNetworkInterfaceSideModalFormProps = Omit<SideModalProps, 'id'> &
  CreateFormProps<NetworkInterfaceCreate, NetworkInterface>

export default function CreateNetworkInterfaceSideModalForm({
  id = 'create-network-interface-form',
  title = 'Add network interface',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: CreateNetworkInterfaceSideModalFormProps) {
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
    },
    onError,
  })

  const vpcs = useApiQuery('projectVpcsGet', { ...pathParams, limit: 50 }).data?.items || []

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={initialValues}
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
      {...props}
    >
      <NameField id="nic-name" />
      <DescriptionField id="nic-description" />
      <Divider />

      <ComboboxField
        id="nic-vpc"
        name="vpcName"
        label="VPC"
        items={vpcs.map((x) => x.name)}
        // required
      />
      <SubnetCombobox
        id="nic-subnet"
        name="subnetName"
        label="Subnet"
        vpcNameField="vpcName"
        vpcs={vpcs}
        // required
      />
      <TextField id="nic-ip" name="ip" label="IP Address" />
    </SideModalForm>
  )
}
