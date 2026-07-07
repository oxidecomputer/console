/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'

import { api, q, queryClient, useApiMutation, usePrefetchedQuery } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSubnetPoolSelector, useSubnetPoolSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { SubnetPoolVisibilityMessage } from './subnet-pool-create'

const subnetPoolView = ({ subnetPool }: PP.SubnetPool) =>
  q(api.systemSubnetPoolView, { path: { pool: subnetPool } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getSubnetPoolSelector(params)
  await queryClient.prefetchQuery(subnetPoolView(selector))
  return null
}

export const handle = makeCrumb('Edit subnet pool')

export default function EditSubnetPoolSideModalForm() {
  const navigate = useNavigate()
  const poolSelector = useSubnetPoolSelector()

  const { data: pool } = usePrefetchedQuery(subnetPoolView(poolSelector))

  const form = useForm({ defaultValues: R.pick(pool, ['name', 'description']) })

  const editPool = useApiMutation(api.systemSubnetPoolUpdate, {
    onSuccess(updatedPool) {
      queryClient.invalidateEndpoint('systemSubnetPoolList')
      navigate(pb.subnetPool({ subnetPool: updatedPool.name }))
      // prettier-ignore
      addToast(<>Subnet pool <HL>{updatedPool.name}</HL> updated</>)

      if (pool.name === updatedPool.name) {
        queryClient.invalidateEndpoint('systemSubnetPoolView')
      }
    },
  })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="subnet pool"
      onDismiss={() => navigate(pb.subnetPool({ subnetPool: poolSelector.subnetPool }))}
      onSubmit={({ name, description }) => {
        editPool.mutate({
          path: { pool: poolSelector.subnetPool },
          body: { name, description },
        })
      }}
      loading={editPool.isPending}
      submitError={editPool.error}
    >
      <SubnetPoolVisibilityMessage />
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <SideModalFormDocs
        docs={[docLinks.subnetPools]}
        apiOp="system_subnet_pool_update"
        cliCmd="system/networking/subnet-pool/update"
      />
    </SideModalForm>
  )
}
