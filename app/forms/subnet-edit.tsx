/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'
import * as R from 'remeda'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type VpcSubnetUpdate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getVpcSubnetSelector, useForm, useVpcSubnetSelector } from '~/hooks'
import { pb } from '~/util/path-builder'

EditSubnetForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc, subnet } = getVpcSubnetSelector(params)
  await apiQueryClient.prefetchQuery('vpcSubnetView', {
    query: { project, vpc },
    path: { subnet },
  })
  return null
}

export function EditSubnetForm() {
  const { project, vpc, subnet: subnetName } = useVpcSubnetSelector()
  const queryClient = useApiQueryClient()

  const navigate = useNavigate()
  const onDismiss = () => navigate(pb.vpcSubnets({ project, vpc }))

  const { data: subnet } = usePrefetchedApiQuery('vpcSubnetView', {
    query: { project, vpc },
    path: { subnet: subnetName },
  })

  const updateSubnet = useApiMutation('vpcSubnetUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList')
      onDismiss()
    },
  })

  const defaultValues = R.pick(subnet, ['name', 'description']) satisfies VpcSubnetUpdate

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="subnet"
      onDismiss={onDismiss}
      onSubmit={(body) => {
        updateSubnet.mutate({
          path: { subnet: subnet.name },
          query: { project, vpc },
          body,
        })
      }}
      loading={updateSubnet.isPending}
      submitError={updateSubnet.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
