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
import {
  getVpcSubnetSelector,
  useForm,
  useVpcSelector,
  useVpcSubnetSelector,
} from '~/hooks'
import { pick } from '~/util/object'
import { pb } from '~/util/path-builder'

EditSubnetForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const vpcSubnetSelector = getVpcSubnetSelector(params)

  await apiQueryClient.prefetchQuery('vpcSubnetView', {
    query: { project: vpcSubnetSelector.project, vpc: vpcSubnetSelector.vpc },
    path: { subnet: vpcSubnetSelector.subnet },
  })

  return null
}

export function EditSubnetForm() {
  const vpcSelector = useVpcSelector()
  const vpcSubnetSelector = useVpcSubnetSelector()
  const queryClient = useApiQueryClient()

  const navigate = useNavigate()
  const onDismiss = () => navigate(pb.vpcSubnets(vpcSelector))

  const { data: subnet } = usePrefetchedApiQuery('vpcSubnetView', {
    query: vpcSelector,
    path: { subnet: vpcSubnetSelector.subnet },
  })

  const updateSubnet = useApiMutation('vpcSubnetUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList')
      onDismiss()
    },
  })

  const defaultValues = pick(subnet, 'name', 'description') /* satisfies VpcSubnetUpdate */

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
          query: vpcSelector,
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
