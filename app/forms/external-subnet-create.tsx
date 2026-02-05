/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { match } from 'ts-pattern'

import { api, q, queryClient, useApiMutation, usePrefetchedQuery } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { NumberField } from '~/components/form/fields/NumberField'
import { RadioField } from '~/components/form/fields/RadioField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { toPoolItem } from '~/components/PoolListboxItem'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

const poolList = q(api.subnetPoolList, { query: { limit: ALL_ISH } })

export async function clientLoader() {
  await queryClient.prefetchQuery(poolList)
  return null
}

export const handle = titleCrumb('New External Subnet')

type FormValues = {
  name: string
  description: string
  allocationType: 'auto' | 'explicit'
  prefixLen: number
  pool: string
  subnet: string
}

const defaultFormValues: Omit<FormValues, 'pool'> = {
  name: '',
  description: '',
  allocationType: 'auto',
  prefixLen: 24,
  subnet: '',
}

export default function CreateExternalSubnetSideModalForm() {
  const { data: pools } = usePrefetchedQuery(poolList)

  const defaultPool = pools.items.find((p) => p.isDefault)

  const projectSelector = useProjectSelector()
  const navigate = useNavigate()

  const createExternalSubnet = useApiMutation(api.externalSubnetCreate, {
    onSuccess(subnet) {
      queryClient.invalidateEndpoint('externalSubnetList')
      // prettier-ignore
      addToast(<>External subnet <HL>{subnet.name}</HL> created</>)
      navigate(pb.externalSubnets(projectSelector))
    },
  })

  const form = useForm({
    defaultValues: { ...defaultFormValues, pool: defaultPool?.name ?? '' },
  })

  const allocationType = form.watch('allocationType')

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="external subnet"
      onDismiss={() => navigate(pb.externalSubnets(projectSelector))}
      onSubmit={({ name, description, allocationType, prefixLen, pool, subnet }) => {
        const allocator = match(allocationType)
          .with('explicit', () => ({ type: 'explicit' as const, subnet }))
          .with('auto', () => ({
            type: 'auto' as const,
            prefixLen,
            poolSelector: { type: 'explicit' as const, pool },
          }))
          .exhaustive()
        createExternalSubnet.mutate({
          query: projectSelector,
          body: { name, description, allocator },
        })
      }}
      loading={createExternalSubnet.isPending}
      submitError={createExternalSubnet.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <RadioField
        name="allocationType"
        label="Allocation method"
        control={form.control}
        items={[
          { value: 'auto', label: 'Auto' },
          { value: 'explicit', label: 'Explicit' },
        ]}
      />
      {allocationType === 'auto' ? (
        <>
          <NumberField
            name="prefixLen"
            label="Prefix length"
            required
            control={form.control}
            // TODO: these min and max are wrong! Pools have an IP version and the min and max depend on that.
            min={8}
            max={32}
            description="The prefix length for the allocated subnet (e.g., 24 for a /24). Minimum 8."
          />
          <ListboxField
            name="pool"
            label="Subnet pool"
            control={form.control}
            placeholder="Select a pool"
            noItemsPlaceholder="No pools linked to silo"
            items={pools.items.map(toPoolItem)}
            required
            description="Subnet pool to allocate from"
          />
        </>
      ) : (
        <TextField
          name="subnet"
          label="Subnet CIDR"
          required
          control={form.control}
          description="The subnet to reserve, e.g., 10.128.1.0/24"
        />
      )}
    </SideModalForm>
  )
}
