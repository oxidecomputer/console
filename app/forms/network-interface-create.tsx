import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { NetworkInterfaceCreate } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import { Divider } from '@oxide/ui'

import {
  DescriptionField,
  ListboxField,
  NameField,
  SideModalForm,
  SubnetListbox,
  TextField,
} from 'app/components/form'
import { useProjectSelector } from 'app/hooks'

const defaultValues: NetworkInterfaceCreate = {
  name: '',
  description: '',
  ip: '',
  subnetName: '',
  vpcName: '',
}

type CreateNetworkInterfaceFormProps = {
  onDismiss: () => void
  onSubmit?: (values: NetworkInterfaceCreate) => void
}

export default function CreateNetworkInterfaceForm({
  onSubmit,
  onDismiss,
}: CreateNetworkInterfaceFormProps) {
  const queryClient = useApiQueryClient()
  const { instanceName } = useParams()
  const projectSelector = useProjectSelector()

  // TODO: pass in this mutation from outside so we don't have to do the instanceName check
  const createNetworkInterface = useApiMutation('instanceNetworkInterfaceCreateV1', {
    onSuccess() {
      invariant(instanceName, 'instanceName is required when posting a network interface')
      queryClient.invalidateQueries('instanceNetworkInterfaceListV1', {
        query: { instance: instanceName, ...projectSelector },
      })
      onDismiss()
    },
  })

  const { data: vpcsData } = useApiQuery('vpcListV1', { query: projectSelector })
  const vpcs = useMemo(() => vpcsData?.items || [], [vpcsData])

  return (
    <SideModalForm
      id="create-network-interface-form"
      title="Add network interface"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={
        onSubmit ||
        ((body) => {
          invariant(
            instanceName,
            'instanceName is required when posting a network interface'
          )

          createNetworkInterface.mutate({
            query: { ...projectSelector, instance: instanceName },
            body,
          })
        })
      }
      loading={createNetworkInterface.isLoading}
      submitError={createNetworkInterface.error}
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <Divider />

          <ListboxField
            name="vpcName"
            label="VPC"
            items={vpcs.map(({ name }) => ({ label: name, value: name }))}
            required
            control={control}
          />
          <SubnetListbox
            name="subnetName"
            label="Subnet"
            vpcNameField="vpcName"
            required
            control={control}
          />
          <TextField name="ip" label="IP Address" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
