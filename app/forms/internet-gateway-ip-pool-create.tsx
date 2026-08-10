/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import {
  api,
  q,
  queryClient,
  sortPools,
  useApiMutation,
  usePrefetchedQuery,
  type InternetGatewayIpPoolCreate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { toPoolItem } from '~/components/PoolListboxItem'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useInternetGatewaySelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const poolList = q(api.ipPoolList, { query: { limit: ALL_ISH } })

export async function clientLoader() {
  await queryClient.prefetchQuery(poolList)
  return null
}

export const handle = titleCrumb('Attach IP Pool')

const defaultValues: InternetGatewayIpPoolCreate = {
  name: '',
  description: '',
  ipPool: '',
}

export default function InternetGatewayIpPoolCreateForm() {
  const { project, vpc, gateway } = useInternetGatewaySelector()
  const navigate = useNavigate()

  const { data: pools } = usePrefetchedQuery(poolList)

  const onDismiss = () => navigate(pb.vpcInternetGateway({ project, vpc, gateway }))

  const attachPool = useApiMutation(api.internetGatewayIpPoolCreate, {
    onSuccess(pool) {
      queryClient.invalidateEndpoint('internetGatewayIpPoolList')
      // prettier-ignore
      addToast(<>IP pool <HL>{pool.name}</HL> attached</>)
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="IP pool"
      title="Attach IP pool"
      onDismiss={onDismiss}
      onSubmit={(body) => attachPool.mutate({ query: { project, vpc, gateway }, body })}
      loading={attachPool.isPending}
      submitError={attachPool.error}
    >
      <NameField
        name="name"
        control={form.control}
        description="A name for this attachment"
      />
      <DescriptionField name="description" control={form.control} />
      <ListboxField
        name="ipPool"
        label="IP pool"
        control={form.control}
        items={sortPools(pools.items).map(toPoolItem)}
        required
        placeholder="Select a pool"
        noItemsPlaceholder="No pools available"
      />
      <SideModalFormDocs docs={[docLinks.gateways]} />
    </SideModalForm>
  )
}
