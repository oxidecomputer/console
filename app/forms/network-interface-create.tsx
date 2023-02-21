import { useMemo } from 'react'
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
import { useAllParams, useProjectSelector } from 'app/hooks'

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
  const { orgName, projectName, instanceName } = useAllParams('orgName', 'projectName')
  const projectSelector = useProjectSelector()

  const createNetworkInterface = useApiMutation('instanceNetworkInterfaceCreate', {
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
            path: { instanceName, projectName, orgName },
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
