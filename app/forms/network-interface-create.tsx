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
import { match } from 'ts-pattern'

import {
  api,
  q,
  type ApiError,
  type InstanceNetworkInterfaceCreate,
  type IpVersion,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { RadioField } from '~/components/form/fields/RadioField'
import { SubnetListbox } from '~/components/form/fields/SubnetListbox'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useProjectSelector } from '~/hooks/use-params'
import { FormDivider } from '~/ui/lib/Divider'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { docLinks } from '~/util/links'

type NetworkInterfaceFormValues = {
  name: string
  description: string
  subnetName: string
  vpcName: string
  ipStackType: IpVersion | 'dual_stack'
  ipv4: string
  ipv6: string
}

const defaultValues: NetworkInterfaceFormValues = {
  name: '',
  description: '',
  subnetName: '',
  vpcName: '',
  ipStackType: 'dual_stack',
  ipv4: '',
  ipv6: '',
}

// Helper to build IP assignment from string
function buildIpAssignment(
  ipString: string
): { type: 'auto' } | { type: 'explicit'; value: string } {
  const trimmed = ipString.trim()
  return trimmed ? { type: 'explicit', value: trimmed } : { type: 'auto' }
}

// Helper to build a single IP stack (v4 or v6)
function buildIpStack(ipString: string) {
  return {
    ip: buildIpAssignment(ipString),
    transitIps: [],
  }
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
        const ipConfig = match(ipStackType)
          .with('v4', () => ({
            type: 'v4' as const,
            value: buildIpStack(ipv4),
          }))
          .with('v6', () => ({
            type: 'v6' as const,
            value: buildIpStack(ipv6),
          }))
          .with('dual_stack', () => ({
            type: 'dual_stack' as const,
            value: {
              v4: buildIpStack(ipv4),
              v6: buildIpStack(ipv6),
            },
          }))
          .exhaustive()

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
      <SideModalFormDocs docs={[docLinks.networkInterfaces, docLinks.vpcs]} />
    </SideModalForm>
  )
}
