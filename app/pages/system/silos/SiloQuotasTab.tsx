/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  apiQueryClient,
  useApiMutation,
  usePrefetchedApiQuery,
  type SiloQuotasUpdate,
} from '~/api'
import { NumberField } from '~/components/form/fields/NumberField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useSiloSelector } from '~/hooks/use-params'
import { Button } from '~/ui/lib/Button'
import { Message } from '~/ui/lib/Message'
import { Table } from '~/ui/lib/Table'
import { classed } from '~/util/classed'
import { links } from '~/util/links'
import { bytesToGiB, formatBytesAs, getUnit, GiB } from '~/util/units'

const Unit = classed.span`ml-1 text-tertiary`

export function SiloQuotasTab() {
  const { silo } = useSiloSelector()
  const { data: utilization } = usePrefetchedApiQuery('siloUtilizationView', {
    path: { silo: silo },
  })

  const { allocated: quotas, provisioned } = utilization
  const memoryUnits = getUnit(Math.max(provisioned.memory, quotas.memory))
  const provisionedMemory = formatBytesAs(provisioned.memory, memoryUnits)
  const quotasMemory = formatBytesAs(quotas.memory, memoryUnits)

  const storageUnits = getUnit(Math.max(provisioned.storage, quotas.storage))
  const provisionedStorage = formatBytesAs(provisioned.storage, storageUnits)
  const quotasStorage = formatBytesAs(quotas.storage, storageUnits)

  const [editing, setEditing] = useState(false)

  return (
    <>
      <Table className="max-w-lg">
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeadCell>Resource</Table.HeadCell>
            <Table.HeadCell>Provisioned</Table.HeadCell>
            <Table.HeadCell>Quota</Table.HeadCell>
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>CPU</Table.Cell>
            <Table.Cell>
              {provisioned.cpus} <Unit>vCPUs</Unit>
            </Table.Cell>
            <Table.Cell>
              {quotas.cpus} <Unit>vCPUs</Unit>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Memory</Table.Cell>
            <Table.Cell>
              {provisionedMemory} <Unit>{memoryUnits}</Unit>
            </Table.Cell>
            <Table.Cell>
              {quotasMemory} <Unit>{memoryUnits}</Unit>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Storage</Table.Cell>
            <Table.Cell>
              {provisionedStorage} <Unit>{storageUnits}</Unit>
            </Table.Cell>
            <Table.Cell>
              {quotasStorage} <Unit>{storageUnits}</Unit>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <div className="mt-4 flex space-x-2">
        <Button size="sm" onClick={() => setEditing(true)}>
          Edit quotas
        </Button>
      </div>
      {editing && <EditQuotasForm onDismiss={() => setEditing(false)} />}
    </>
  )
}

function EditQuotasForm({ onDismiss }: { onDismiss: () => void }) {
  const { silo } = useSiloSelector()
  const { data: utilization } = usePrefetchedApiQuery('siloUtilizationView', {
    path: { silo: silo },
  })
  const quotas = utilization.allocated

  // required because we need to rule out undefined because NumberField hates that
  const defaultValues: Required<SiloQuotasUpdate> = {
    cpus: quotas.cpus,
    memory: bytesToGiB(quotas.memory),
    storage: bytesToGiB(quotas.storage),
  }

  const form = useForm({ defaultValues })

  const updateQuotas = useApiMutation('siloQuotasUpdate', {
    onSuccess() {
      apiQueryClient.invalidateQueries('siloUtilizationView')
      onDismiss()
    },
  })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="Quotas"
      title="Edit quotas"
      onDismiss={onDismiss}
      onSubmit={({ cpus, memory, storage }) =>
        updateQuotas.mutate({
          body: {
            cpus,
            memory: memory * GiB,
            // TODO: we use GiB on instance create but TiB on utilization. HM
            storage: storage * GiB,
          },
          path: { silo },
        })
      }
      loading={updateQuotas.isPending}
      submitError={updateQuotas.error}
    >
      <Message content={<LearnMore />} variant="info" />

      <NumberField name="cpus" label="CPU" units="vCPUs" required control={form.control} />
      <NumberField
        name="memory"
        label="Memory"
        units="GiB"
        required
        control={form.control}
      />
      <NumberField
        name="storage"
        label="Storage"
        units="GiB"
        required
        control={form.control}
      />
    </SideModalForm>
  )
}

function LearnMore() {
  return (
    <>
      If a quota is set below the amount currently in use, users will not be able to
      provision resources. Learn more about quotas in the{' '}
      <a
        href={links.siloQuotasDocs}
        // don't need color and hover color because message text is already color-info anyway
        className="underline"
        target="_blank"
        rel="noreferrer"
      >
        Silos
      </a>{' '}
      guide.
    </>
  )
}
