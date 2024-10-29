/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import {
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  type FloatingIpCreate,
} from '@oxide/api'

import { AccordionItem } from '~/components/AccordionItem'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { toIpPoolItem } from '~/components/form/fields/ip-pool-item'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

const defaultValues: Omit<FloatingIpCreate, 'ip'> = {
  name: '',
  description: '',
  pool: undefined,
}

export function CreateFloatingIpSideModalForm() {
  // Fetch 1000 to we can be sure to get them all. Don't bother prefetching
  // because the list is hidden under the Advanced accordion.
  const { data: allPools } = useApiQuery('projectIpPoolList', { query: { limit: ALL_ISH } })

  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const navigate = useNavigate()

  const createFloatingIp = useApiMutation('floatingIpCreate', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
      queryClient.invalidateQueries('ipPoolUtilizationView')
      addToast({ content: 'Your Floating IP has been created' })
      navigate(pb.floatingIps(projectSelector))
    },
  })

  const form = useForm({ defaultValues })

  const [openItems, setOpenItems] = useState<string[]>([])

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="floating IP"
      onDismiss={() => navigate(pb.floatingIps(projectSelector))}
      onSubmit={(body) => createFloatingIp.mutate({ query: projectSelector, body })}
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
          <Message
            variant="info"
            content="If you don’t specify a pool, the default will be used"
          />

          <ListboxField
            name="pool"
            items={(allPools?.items || []).map(toIpPoolItem)}
            label="IP pool"
            control={form.control}
            placeholder="Select a pool"
          />
        </AccordionItem>
      </Accordion.Root>
    </SideModalForm>
  )
}
