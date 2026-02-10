/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import {
  api,
  isUnicastPool,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type FloatingIpCreate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { IpPoolSelector } from '~/components/form/fields/IpPoolSelector'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
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

export const handle = titleCrumb('New Floating IP')

export default function CreateFloatingIpSideModalForm() {
  const { data: allPools } = usePrefetchedQuery(poolList)

  // Only unicast pools can be used for floating IPs
  const unicastPools = useMemo(() => allPools.items.filter(isUnicastPool), [allPools])

  const defaultPool = useMemo(() => {
    const defaults = unicastPools.filter((p) => p.isDefault)
    // Only preselect if there's exactly one default; if both v4 and v6
    // defaults exist, let the user choose
    return defaults.length === 1 ? defaults[0].name : ''
  }, [unicastPools])

  const projectSelector = useProjectSelector()
  const navigate = useNavigate()

  const createFloatingIp = useApiMutation(api.floatingIpCreate, {
    onSuccess(floatingIp) {
      queryClient.invalidateEndpoint('floatingIpList')
      queryClient.invalidateEndpoint('systemIpPoolUtilizationView')
      // prettier-ignore
      addToast(<>Floating IP <HL>{floatingIp.name}</HL> created</>)
      navigate(pb.floatingIps(projectSelector))
    },
  })

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      pool: defaultPool,
    },
  })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="floating IP"
      onDismiss={() => navigate(pb.floatingIps(projectSelector))}
      onSubmit={({ pool, name, description }) => {
        const body: FloatingIpCreate = {
          name,
          description,
          addressAllocator: {
            type: 'auto',
            poolSelector: { type: 'explicit', pool },
          },
        }
        createFloatingIp.mutate({ query: projectSelector, body })
      }}
      loading={createFloatingIp.isPending}
      submitError={createFloatingIp.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <IpPoolSelector control={form.control} poolFieldName="pool" pools={unicastPools} />
      <SideModalFormDocs docs={[docLinks.floatingIps]} />
    </SideModalForm>
  )
}
