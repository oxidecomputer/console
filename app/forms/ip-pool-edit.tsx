/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { apiq, queryClient, useApiMutation, usePrefetchedQuery } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getIpPoolSelector, useIpPoolSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { IpPoolVisibilityMessage } from './ip-pool-create'

const ipPoolView = ({ pool }: PP.IpPool) => apiq('ipPoolView', { path: { pool } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getIpPoolSelector(params)
  await queryClient.prefetchQuery(ipPoolView(selector))
  return null
}

export const handle = makeCrumb('Edit IP pool')

export default function EditIpPoolSideModalForm() {
  const navigate = useNavigate()
  const poolSelector = useIpPoolSelector()

  const { data: pool } = usePrefetchedQuery(ipPoolView(poolSelector))

  const form = useForm({ defaultValues: pool })

  const editPool = useApiMutation('ipPoolUpdate', {
    onSuccess(updatedPool) {
      queryClient.invalidateEndpoint('ipPoolList')
      navigate(pb.ipPool({ pool: updatedPool.name }))
      addToast(<>IP pool <HL>{updatedPool.name}</HL> updated</>) // prettier-ignore

      // Only invalidate if we're staying on the same page. If the name
      // _has_ changed, invalidating ipPoolView causes an error page to flash
      // while the loader for the target page is running because the current
      // page's pool gets cleared out while we're still on the page. If we're
      // navigating to a different page, its query will fetch anew regardless.
      if (pool.name === updatedPool.name) {
        queryClient.invalidateEndpoint('ipPoolView')
      }
    },
  })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="IP pool"
      onDismiss={() => navigate(pb.ipPool({ pool: poolSelector.pool }))}
      onSubmit={({ name, description }) => {
        editPool.mutate({ path: poolSelector, body: { name, description } })
      }}
      loading={editPool.isPending}
      submitError={editPool.error}
    >
      <IpPoolVisibilityMessage />
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
