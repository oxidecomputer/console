/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getVpcSelector, useForm, useToast, useVpcSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditVpcSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  await apiQueryClient.prefetchQuery('vpcView', { path: { vpc }, query: { project } })
  return null
}

export function EditVpcSideModalForm() {
  const { vpc: vpcName, project } = useVpcSelector()
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const { data: vpc } = usePrefetchedApiQuery('vpcView', {
    path: { vpc: vpcName },
    query: { project },
  })

  const onDismiss = () => navigate(pb.vpcs({ project }))

  const editVpc = useApiMutation('vpcUpdate', {
    async onSuccess(vpc) {
      queryClient.invalidateQueries('vpcList')
      queryClient.setQueryData(
        'vpcView',
        { path: { vpc: vpc.name }, query: { project } },
        vpc
      )
      addToast({ content: 'Your VPC has been created' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues: vpc })

  return (
    <SideModalForm
      id="edit-vpc-form"
      title="Edit VPC"
      form={form}
      onDismiss={onDismiss}
      onSubmit={({ name, description, dnsName }) => {
        editVpc.mutate({
          path: { vpc: vpcName },
          query: { project },
          body: { name, description, dnsName },
        })
      }}
      loading={editVpc.isPending}
      submitLabel="Save changes"
      submitError={editVpc.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <NameField name="dnsName" label="DNS name" required={false} control={form.control} />
    </SideModalForm>
  )
}
