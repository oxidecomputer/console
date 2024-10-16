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
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
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
import { HLs } from '~/components/HL'
import { getVpcSubnetSelector, useVpcSubnetSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { FormDivider } from '~/ui/lib/Divider'
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
    onSuccess(subnet) {
      queryClient.invalidateQueries('vpcSubnetList')
      addToast({
        content: (
          <>
            Subnet <HLs>{subnet.name}</HLs> updated
          </>
        ),
      })
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
