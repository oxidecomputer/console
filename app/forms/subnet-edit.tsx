/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiq,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type VpcSubnetUpdate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import {
  customRouterDataToForm,
  customRouterFormToData,
  useCustomRouterItems,
} from '~/components/form/fields/useItemsList'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { getVpcSubnetSelector, useVpcSubnetSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { FormDivider } from '~/ui/lib/Divider'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const subnetView = ({ project, vpc, subnet }: PP.VpcSubnet) =>
  apiq('vpcSubnetView', { query: { project, vpc }, path: { subnet } })

EditSubnetForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const selector = getVpcSubnetSelector(params)
  await queryClient.prefetchQuery(subnetView(selector))
  return null
}

export function EditSubnetForm() {
  const subnetSelector = useVpcSubnetSelector()
  const { project, vpc } = subnetSelector

  const navigate = useNavigate()
  const onDismiss = () => navigate(pb.vpcSubnets({ project, vpc }))

  const { data: subnet } = usePrefetchedQuery(subnetView(subnetSelector))

  const updateSubnet = useApiMutation('vpcSubnetUpdate', {
    onSuccess(subnet) {
      queryClient.invalidateEndpoint('vpcSubnetList')
      addToast(<>Subnet <HL>{subnet.name}</HL> updated</>) // prettier-ignore
      onDismiss()
    },
  })

  const defaultValues: Required<VpcSubnetUpdate> = {
    name: subnet.name,
    description: subnet.description,
    customRouter: customRouterDataToForm(subnet.customRouterId),
  }

  const form = useForm({ defaultValues })
  const { isLoading, items } = useCustomRouterItems()

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
          body: {
            name: body.name,
            description: body.description,
            customRouter: customRouterFormToData(body.customRouter),
          },
        })
      }}
      loading={updateSubnet.isPending}
      submitError={updateSubnet.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <FormDivider />
      <ListboxField
        label="Custom router"
        name="customRouter"
        placeholder="Select a custom router"
        isLoading={isLoading}
        items={items}
        control={form.control}
        required
      />
    </SideModalForm>
  )
}
