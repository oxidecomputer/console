import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { ApiError, InstanceNetworkInterfaceCreate } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { FormDivider } from '@oxide/ui'

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
  submitError?: ApiError | null
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

  const form = useForm({ mode: 'all', defaultValues })

  return (
    <SideModalForm
      id="create-network-interface-form"
      title="Add network interface"
      form={form}
      onDismiss={onDismiss}
      onSubmit={onSubmit}
      loading={loading}
      submitError={submitError}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <FormDivider />

      <ListboxField
        name="vpcName"
        label="VPC"
        items={vpcs.map(({ name }) => ({ label: name, value: name }))}
        required
        control={form.control}
      />
      <SubnetListbox
        name="subnetName"
        label="Subnet"
        vpcNameField="vpcName"
        required
        control={form.control}
      />
      <TextField name="ip" label="IP Address" control={form.control} />
    </SideModalForm>
  )
}
