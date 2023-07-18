/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import type { VpcCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { toPathQuery } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm, TextField } from 'app/components/form'
import { useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const defaultValues: VpcCreate = {
  name: '',
  description: '',
  dnsName: '',
}

export function CreateVpcSideModalForm() {
  const projectSelector = useProjectSelector()
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const createVpc = useApiMutation('vpcCreate', {
    onSuccess(vpc) {
      const vpcSelector = { ...projectSelector, vpc: vpc.name }
      queryClient.invalidateQueries('vpcList', { query: projectSelector })
      // avoid the vpc fetch when the vpc page loads since we have the data
      queryClient.setQueryData('vpcView', toPathQuery('vpc', vpcSelector), vpc)
      addToast({
        content: 'Your VPC has been created',
      })
      navigate(pb.vpc(vpcSelector))
    },
  })

  const form = useForm({ mode: 'all', defaultValues })

  return (
    <SideModalForm
      form={form}
      id="create-vpc-form"
      title="Create VPC"
      onSubmit={(values) => createVpc.mutate({ query: projectSelector, body: values })}
      onDismiss={() => navigate(pb.vpcs(projectSelector))}
      loading={createVpc.isLoading}
      submitError={createVpc.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <NameField name="dnsName" label="DNS name" control={form.control} />
      <TextField name="ipv6Prefix" label="IPV6 prefix" control={form.control} />
    </SideModalForm>
  )
}
