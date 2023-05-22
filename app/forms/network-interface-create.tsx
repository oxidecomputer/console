import { useMemo } from 'react'

import type { InstanceNetworkInterfaceCreate, ProcessedError } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
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

const defaultValues: InstanceNetworkInterfaceCreate = {
  name: '',
  description: '',
  ip: '',
  subnetName: '',
  vpcName: '',
}

type CreateNetworkInterfaceFormProps = {
  onDismiss: () => void
  onSubmit: (values: InstanceNetworkInterfaceCreate) => void
  loading?: boolean
  submitError?: ProcessedError | null
}

/**
 * Can be used with either a `setState` or a real mutation as `onSubmit`, hence
 * the optional `loading` and `submitError`
 */
export default function CreateNetworkInterfaceForm({
  onSubmit,
  onDismiss,
  loading,
  submitError = null,
}: CreateNetworkInterfaceFormProps) {
  const projectSelector = useProjectSelector()

  const { data: vpcsData } = useApiQuery('vpcList', { query: projectSelector })
  const vpcs = useMemo(() => vpcsData?.items || [], [vpcsData])

  return (
    <SideModalForm
      id="create-network-interface-form"
      title="Add network interface"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={onSubmit}
      loading={loading}
      submitError={submitError}
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
