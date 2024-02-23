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
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type FloatingIpCreate,
  type SiloIpPool,
} from '@oxide/api'
import { Badge, Message } from '@oxide/ui'
import { validateIp } from '@oxide/util'

import { AccordionItem } from 'app/components/AccordionItem'
import {
  DescriptionField,
  ListboxField,
  NameField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import { useForm, useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

CreateFloatingIpSideModalForm.loader = async () => {
  await apiQueryClient.prefetchQuery('projectIpPoolList', {
    query: { limit: 1000 },
  })
  return null
}

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

const defaultValues: SetRequired<FloatingIpCreate, 'address'> = {
  name: '',
  description: '',
  pool: undefined,
  address: '',
}

export function CreateFloatingIpSideModalForm() {
  // Fetch 1000 to we can be sure to get them all.
  const { data: allPools } = usePrefetchedApiQuery('projectIpPoolList', {
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
      onSubmit={({ address, ...rest }) => {
        createFloatingIp.mutate({
          query: projectSelector,
          // if address is '', evaluate as false and send as undefined
          body: { address: address || undefined, ...rest },
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
            items={allPools.items.map((p) => toListboxItem(p))}
            label="IP pool"
            control={form.control}
            placeholder="Select pool"
          />
          <TextField
            name="address"
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
