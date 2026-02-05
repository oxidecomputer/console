/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { api, queryClient, useApiMutation, type ExternalSubnetCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { NumberField } from '~/components/form/fields/NumberField'
import { RadioField } from '~/components/form/fields/RadioField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

export const handle = titleCrumb('New External Subnet')

export default function CreateExternalSubnetSideModalForm() {
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
    defaultValues: {
      name: '',
      description: '',
      allocationType: 'auto' as 'auto' | 'explicit',
      prefixLen: 24,
      pool: '',
      subnet: '',
    },
  })

  const allocationType = form.watch('allocationType')

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="external subnet"
      onDismiss={() => navigate(pb.externalSubnets(projectSelector))}
      onSubmit={({ name, description, allocationType, prefixLen, pool, subnet }) => {
        const body: ExternalSubnetCreate =
          allocationType === 'explicit'
            ? { name, description, allocator: { type: 'explicit', subnet } }
            : {
                name,
                description,
                allocator: {
                  type: 'auto',
                  prefixLen,
                  poolSelector: pool ? { type: 'explicit', pool } : undefined,
                },
              }
        createExternalSubnet.mutate({ query: projectSelector, body })
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
            min={8}
            max={32}
            description="The prefix length for the allocated subnet (e.g., 24 for a /24). Minimum 8."
          />
          {/* Subnet pool list endpoint not yet available
             https://github.com/oxidecomputer/omicron/issues/9814 */}
          <ListboxField
            name="pool"
            label="Subnet pool"
            control={form.control}
            placeholder="Default"
            noItemsPlaceholder="No pools linked to silo"
            items={[]}
            description="Subnet pool to allocate from. If not selected, the silo default is used."
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
