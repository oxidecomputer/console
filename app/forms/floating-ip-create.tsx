/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SetRequired } from 'type-fest'

import {
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  type FloatingIpCreate,
  type SiloIpPool,
} from '@oxide/api'
import { Message } from '@oxide/ui'
import { validateIp } from '@oxide/util'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { Badge } from '~/ui/lib/Badge'
import { AccordionItem } from 'app/components/AccordionItem'
import { useForm, useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const toListboxItem = (p: SiloIpPool) => {
  if (!p.isDefault) {
    return { value: p.name, label: p.name }
  }
  // For the default pool, add a label to the dropdown
  return {
    value: p.name,
    labelString: p.name,
    label: (
      <>
        {p.name}{' '}
        <Badge className="ml-1" color="neutral">
          default
        </Badge>
      </>
    ),
  }
}

const defaultValues: SetRequired<FloatingIpCreate, 'ip'> = {
  name: '',
  description: '',
  pool: undefined,
  ip: '',
}

export function CreateFloatingIpSideModalForm() {
  // Fetch 1000 to we can be sure to get them all. Don't bother prefetching
  // because the list is hidden under the Advanced accordion.
  const { data: allPools } = useApiQuery('projectIpPoolList', {
    query: { limit: 1000 },
  })

  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const addToast = useToast()
  const navigate = useNavigate()

  const createFloatingIp = useApiMutation('floatingIpCreate', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
      addToast({ content: 'Your Floating IP has been created' })
      navigate(pb.floatingIps(projectSelector))
    },
  })

  const form = useForm({ defaultValues })
  const isPoolSelected = !!form.watch('pool')

  const [openItems, setOpenItems] = useState<string[]>([])

  return (
    <SideModalForm
      id="create-floating-ip-form"
      title="Create Floating IP"
      form={form}
      onDismiss={() => navigate(pb.floatingIps(projectSelector))}
      onSubmit={({ ip, ...rest }) => {
        createFloatingIp.mutate({
          query: projectSelector,
          // if address is '', evaluate as false and send as undefined
          body: { ip: ip || undefined, ...rest },
        })
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
          <Message
            variant="info"
            content="If you don’t specify a pool, the default will be used"
          />

          <ListboxField
            name="pool"
            items={(allPools?.items || []).map((p) => toListboxItem(p))}
            label="IP pool"
            control={form.control}
            placeholder="Select pool"
          />
          <TextField
            name="ip"
            label="IP address"
            control={form.control}
            disabled={!isPoolSelected}
            transform={(v) => v.replace(/\s/g, '')}
            validate={(ip) =>
              ip && !validateIp(ip).valid ? 'Not a valid IP address' : true
            }
          />
        </AccordionItem>
      </Accordion.Root>
    </SideModalForm>
  )
}
