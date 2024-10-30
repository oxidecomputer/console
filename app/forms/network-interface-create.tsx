/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { SetRequired } from 'type-fest'

import { useApiQuery, type ApiError, type InstanceNetworkInterfaceCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { SubnetListbox } from '~/components/form/fields/SubnetListbox'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useProjectSelector } from '~/hooks/use-params'
import { FormDivider } from '~/ui/lib/Divider'

const defaultValues: SetRequired<InstanceNetworkInterfaceCreate, 'ip'> = {
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
export function CreateNetworkInterfaceForm({
  onSubmit,
  onDismiss,
  loading,
  submitError = null,
}: CreateNetworkInterfaceFormProps) {
  const projectSelector = useProjectSelector()

  const { data: vpcsData } = useApiQuery('vpcList', { query: projectSelector })
  const vpcs = useMemo(() => vpcsData?.items || [], [vpcsData])

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="network interface"
      title="Add network interface"
      onDismiss={onDismiss}
      onSubmit={({ ip, ...rest }) => onSubmit({ ip: ip.trim() || undefined, ...rest })}
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
        placeholder="Select a VPC"
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
