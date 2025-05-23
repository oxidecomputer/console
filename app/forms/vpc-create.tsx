/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { useApiMutation, useApiQueryClient, type VpcCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

const defaultValues: VpcCreate = {
  name: '',
  description: '',
  dnsName: '',
}

export const handle = titleCrumb('New VPC')

export default function CreateVpcSideModalForm() {
  const projectSelector = useProjectSelector()
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()

  const createVpc = useApiMutation('vpcCreate', {
    onSuccess(vpc) {
      queryClient.invalidateQueries('vpcList')
      // avoid the vpc fetch when the vpc page loads since we have the data
      queryClient.setQueryData(
        'vpcView',
        { path: { vpc: vpc.name }, query: projectSelector },
        vpc
      )
      addToast(<>VPC <HL>{vpc.name}</HL> created</>) // prettier-ignore
      navigate(pb.vpc({ vpc: vpc.name, ...projectSelector }))
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="VPC"
      onSubmit={(values) => createVpc.mutate({ query: projectSelector, body: values })}
      onDismiss={() => navigate(pb.vpcs(projectSelector))}
      loading={createVpc.isPending}
      submitError={createVpc.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <NameField name="dnsName" label="DNS name" control={form.control} />
      <TextField name="ipv6Prefix" label="IPV6 prefix" control={form.control} />
    </SideModalForm>
  )
}
