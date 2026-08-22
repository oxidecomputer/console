/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router'

import { api, q, queryClient, usePrefetchedQuery } from '~/api'
import { EditQuotasSideModalForm } from '~/forms/silo-quotas-edit'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSiloSelector, useSiloSelector } from '~/hooks/use-params'
import { Button } from '~/ui/lib/Button'
import { Table } from '~/ui/lib/Table'
import { ValueUnit } from '~/ui/lib/ValueUnit'
import type * as PP from '~/util/path-params'
import { bytesToGiB } from '~/util/units'

const siloUtil = ({ silo }: PP.Silo) => q(api.siloUtilizationView, { path: { silo } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { silo } = getSiloSelector(params)
  await queryClient.prefetchQuery(siloUtil({ silo }))
  return null
}

export default function SiloQuotasTab() {
  const { silo } = useSiloSelector()
  const { data: utilization } = usePrefetchedQuery(siloUtil({ silo }))

  const { allocated: quotas, provisioned } = utilization

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
              <ValueUnit value={provisioned.cpus} unit="vCPUs" />
            </Table.Cell>
            <Table.Cell>
              <ValueUnit value={quotas.cpus} unit="vCPUs" />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Memory</Table.Cell>
            <Table.Cell>
              <ValueUnit value={bytesToGiB(provisioned.memory)} unit="GiB" />
            </Table.Cell>
            <Table.Cell>
              <ValueUnit value={bytesToGiB(quotas.memory)} unit="GiB" />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Storage</Table.Cell>
            <Table.Cell>
              <ValueUnit value={bytesToGiB(provisioned.storage)} unit="GiB" />
            </Table.Cell>
            <Table.Cell>
              <ValueUnit value={bytesToGiB(quotas.storage)} unit="GiB" />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <div className="mt-4 flex space-x-2">
        <Button size="sm" onClick={() => setEditing(true)}>
          Edit quotas
        </Button>
      </div>
      {editing && (
        <EditQuotasSideModalForm
          silo={silo}
          quotas={quotas}
          onDismiss={() => setEditing(false)}
        />
      )}
    </>
  )
}

export const handle = makeCrumb('Quotas')
