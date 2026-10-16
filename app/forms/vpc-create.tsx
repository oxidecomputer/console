/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { api, q, queryClient, useApiMutation, type VpcCreate } from '@oxide/api'

import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { validateVpcIpv6Prefix } from '~/util/ip'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

type VpcCreateFormValues = {
  name: string
  description: string
  dnsName: string
  ipv6Prefix: string
  createDefaultSubnet: boolean
}

const defaultValues: VpcCreateFormValues = {
  name: '',
  description: '',
  dnsName: '',
  ipv6Prefix: '',
  createDefaultSubnet: true,
}

export const handle = titleCrumb('New VPC')

export default function CreateVpcSideModalForm() {
  const projectSelector = useProjectSelector()
  const navigate = useNavigate()

  const createVpc = useApiMutation(api.vpcCreate, {
    onSuccess(vpc) {
      queryClient.invalidateEndpoint('vpcList')
      // avoid the vpc fetch when the vpc page loads since we have the data
      const vpcView = q(api.vpcView, {
        path: { vpc: vpc.name },
        query: projectSelector,
      })
      queryClient.setQueryData(vpcView.queryKey, vpc)
      // prettier-ignore
      addToast(<>VPC <HL>{vpc.name}</HL> created</>)
      navigate(pb.vpc({ vpc: vpc.name, ...projectSelector }))
    },
  })

  const form = useForm({ defaultValues })
  const createDefaultSubnet = form.watch('createDefaultSubnet')

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="VPC"
      onSubmit={({ ipv6Prefix, createDefaultSubnet, ...rest }) => {
        const body: VpcCreate = {
          ...rest,
          ipv6Prefix: ipv6Prefix.trim() || undefined,
          // omitting `defaults` creates all of them. `{}` also skips any the API adds later
          defaults: createDefaultSubnet ? undefined : {},
        }
        createVpc.mutate({ query: projectSelector, body })
      }}
      onDismiss={() => navigate(pb.vpcs(projectSelector))}
      loading={createVpc.isPending || createVpc.isSuccess}
      submitError={createVpc.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <NameField name="dnsName" label="DNS name" control={form.control} />
      <TextField
        name="ipv6Prefix"
        label="IPv6 prefix"
        control={form.control}
        validate={(value) => {
          const prefix = value.trim()
          // field is optional — API generates a prefix if none is given
          if (!prefix) return
          return validateVpcIpv6Prefix(prefix)
        }}
      />
      <div className="space-y-2">
        <CheckboxField name="createDefaultSubnet" control={form.control}>
          Create default subnet
        </CheckboxField>
        {!createDefaultSubnet && (
          <Message
            variant="info"
            className="max-w-lg"
            content="An instance can only attach to a VPC with a subnet"
          />
        )}
      </div>
      <SideModalFormDocs docs={[docLinks.vpcs]} />
    </SideModalForm>
  )
}
