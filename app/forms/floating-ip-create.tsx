/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
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
import { validateIp } from '@oxide/util'

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

export function CreateFloatingIpSideModalForm() {
  // Fetch 1000 to we can be sure to get them all.
  const { data: allPools } = usePrefetchedApiQuery('projectIpPoolList', {
    query: { limit: 1000 },
  })

  const defaultPool = useMemo(
    () => allPools.items.find((p) => p.isDefault)?.name,
    [allPools]
  )

  const defaultValues: SetRequired<FloatingIpCreate, 'address'> = {
    name: '',
    description: '',
    pool: defaultPool,
    address: '',
  }

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

  const toListboxItem = (p: SiloIpPool) => {
    if (p.name !== defaultPool) {
      return {
        value: p.name,
        label: p.name,
      }
    }
    // For the default pool, add a label to the dropdown
    return {
      value: p.name,
      labelString: p.name,
      label: (
        <>
          {p.name}{' '}
          <span className="text-quaternary selected:text-accent-secondary">(default)</span>
        </>
      ),
    }
  }

  const [poolName] = useWatch({ control: form.control, name: ['pool'] })
  const isPoolSelected = poolName && poolName.length > 0

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
      <ListboxField
        name="pool"
        items={allPools.items.map((p) => toListboxItem(p))}
        label="Pool"
        control={form.control}
      />
      <TextField
        name="address"
        control={form.control}
        disabled={!isPoolSelected}
        transform={(v) => v.replace(/\s/g, '')}
        validate={(ip) => (ip && !validateIp(ip).valid ? 'Not a valid IP address' : true)}
      />
    </SideModalForm>
  )
}
