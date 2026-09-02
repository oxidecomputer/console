/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import type { SetNonNullable } from 'type-fest'

import { api, q, queryClient, useApiMutation, type VpcCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { validateVpcIpv6Prefix } from '~/util/ip'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const defaultValues: SetNonNullable<Required<VpcCreate>> = {
  name: '',
  description: '',
  dnsName: '',
  ipv6Prefix: '',
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

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="VPC"
      onSubmit={({ ipv6Prefix, ...rest }) =>
        createVpc.mutate({
          query: projectSelector,
          body: { ...rest, ipv6Prefix: ipv6Prefix.trim() || undefined },
        })
      }
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
      <SideModalFormDocs docs={[docLinks.vpcs]} />
    </SideModalForm>
  )
}
