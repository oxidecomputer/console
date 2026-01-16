/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { api, q, type ApiError, type InstanceNetworkInterfaceCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { RadioField } from '~/components/form/fields/RadioField'
import { SubnetListbox } from '~/components/form/fields/SubnetListbox'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useProjectSelector } from '~/hooks/use-params'
import { FormDivider } from '~/ui/lib/Divider'

type IpStackType = 'v4' | 'v6' | 'dual_stack'

const defaultValues = {
  name: '',
  description: '',
  subnetName: '',
  vpcName: '',
  ipStackType: 'dual_stack' as IpStackType,
  ipv4: '',
  ipv6: '',
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
  loading = false,
  submitError = null,
}: CreateNetworkInterfaceFormProps) {
  const projectSelector = useProjectSelector()

  const { data: vpcsData } = useQuery(q(api.vpcList, { query: projectSelector }))
  const vpcs = useMemo(() => vpcsData?.items || [], [vpcsData])

  const form = useForm({ defaultValues })
  const ipStackType = form.watch('ipStackType')

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="network interface"
      title="Add network interface"
      onDismiss={onDismiss}
      onSubmit={({ ipStackType, ipv4, ipv6, ...rest }) => {
        // Build ipConfig based on the selected IP stack type
        let ipConfig: InstanceNetworkInterfaceCreate['ipConfig']

        if (ipStackType === 'v4') {
          ipConfig = {
            type: 'v4',
            value: {
              ip: ipv4.trim() ? { type: 'explicit', value: ipv4.trim() } : { type: 'auto' },
              transitIps: [],
            },
          }
        } else if (ipStackType === 'v6') {
          ipConfig = {
            type: 'v6',
            value: {
              ip: ipv6.trim() ? { type: 'explicit', value: ipv6.trim() } : { type: 'auto' },
              transitIps: [],
            },
          }
        } else {
          // dual_stack
          ipConfig = {
            type: 'dual_stack',
            value: {
              v4: {
                ip: ipv4.trim()
                  ? { type: 'explicit', value: ipv4.trim() }
                  : { type: 'auto' },
                transitIps: [],
              },
              v6: {
                ip: ipv6.trim()
                  ? { type: 'explicit', value: ipv6.trim() }
                  : { type: 'auto' },
                transitIps: [],
              },
            },
          }
        }

        onSubmit({ ...rest, ipConfig })
      }}
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

      <RadioField
        name="ipStackType"
        label="IP configuration"
        control={form.control}
        column
        items={[
          {
            value: 'dual_stack',
            label: 'IPv4 & IPv6',
          },
          {
            value: 'v4',
            label: 'IPv4',
          },
          {
            value: 'v6',
            label: 'IPv6',
          },
        ]}
      />

      {(ipStackType === 'v4' || ipStackType === 'dual_stack') && (
        <TextField
          name="ipv4"
          label="IPv4 Address"
          control={form.control}
          placeholder="Leave blank for auto-assignment"
        />
      )}

      {(ipStackType === 'v6' || ipStackType === 'dual_stack') && (
        <TextField
          name="ipv6"
          label="IPv6 Address"
          control={form.control}
          placeholder="Leave blank for auto-assignment"
        />
      )}
    </SideModalForm>
  )
}
