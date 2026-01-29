/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import {
  api,
  q,
  queryClient,
  useApiMutation,
  type FloatingIpCreate,
  type IpVersion,
} from '@oxide/api'

import { AccordionItem } from '~/components/AccordionItem'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import {
  IpPoolSelector,
  type UnicastIpPool,
} from '~/components/form/fields/IpPoolSelector'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { ALL_ISH } from '~/util/consts'
import { getDefaultIps } from '~/util/ip'
import { pb } from '~/util/path-builder'

type FloatingIpCreateFormData = {
  name: string
  description: string
  pool?: string
  ipVersion: IpVersion
}

const defaultValues: FloatingIpCreateFormData = {
  name: '',
  description: '',
  ipVersion: 'v4',
}

export const handle = titleCrumb('New Floating IP')

export default function CreateFloatingIpSideModalForm() {
  // Fetch 1000 to we can be sure to get them all. Don't bother prefetching
  // because the list is hidden under the Advanced accordion.
  const { data: allPools } = useQuery(
    q(api.projectIpPoolList, { query: { limit: ALL_ISH } })
  )

  // Only unicast pools can be used for floating IPs
  const unicastPools = useMemo(() => {
    if (!allPools) return []
    return allPools.items.filter((p) => p.poolType === 'unicast') as UnicastIpPool[]
  }, [allPools])

  const projectSelector = useProjectSelector()
  const navigate = useNavigate()

  const createFloatingIp = useApiMutation(api.floatingIpCreate, {
    onSuccess(floatingIp) {
      queryClient.invalidateEndpoint('floatingIpList')
      queryClient.invalidateEndpoint('ipPoolUtilizationView')
      // prettier-ignore
      addToast(<>Floating IP <HL>{floatingIp.name}</HL> created</>)
      navigate(pb.floatingIps(projectSelector))
    },
  })

  const form = useForm({ defaultValues })
  const pool = form.watch('pool')

  const [openItems, setOpenItems] = useState<string[]>([])

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="floating IP"
      onDismiss={() => navigate(pb.floatingIps(projectSelector))}
      onSubmit={({ pool, ipVersion, ...values }) => {
        // When using default pool, derive ipVersion from available defaults
        let effectiveIpVersion = ipVersion
        if (!pool) {
          const { hasV4Default, hasV6Default } = getDefaultIps(unicastPools)

          // If only one default exists, use that version
          if (hasV4Default && !hasV6Default) {
            effectiveIpVersion = 'v4'
          } else if (hasV6Default && !hasV4Default) {
            effectiveIpVersion = 'v6'
          }
          // If both exist, use form's ipVersion (user's choice)
        }

        const body: FloatingIpCreate = {
          ...values,
          addressAllocator: pool
            ? {
                type: 'auto' as const,
                poolSelector: { type: 'explicit' as const, pool },
              }
            : {
                type: 'auto' as const,
                poolSelector: { type: 'auto' as const, ipVersion: effectiveIpVersion },
              },
        }
        createFloatingIp.mutate({ query: projectSelector, body })
      }}
      loading={createFloatingIp.isPending}
      submitError={createFloatingIp.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />

      <Accordion.Root
        type="multiple"
        className="mt-12 max-w-lg"
        value={openItems}
        onValueChange={setOpenItems}
      >
        <AccordionItem
          isOpen={openItems.includes('advanced')}
          label="Advanced"
          value="advanced"
        >
          <IpPoolSelector
            control={form.control}
            poolFieldName="pool"
            ipVersionFieldName="ipVersion"
            pools={unicastPools}
            currentPool={pool}
            setValue={form.setValue}
          />
        </AccordionItem>
      </Accordion.Root>
    </SideModalForm>
  )
}
