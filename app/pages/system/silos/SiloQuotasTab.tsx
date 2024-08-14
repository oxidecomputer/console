/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { usePrefetchedApiQuery } from '~/api'
import { useSiloSelector } from '~/hooks/use-params'
import { Table } from '~/ui/lib/Table'
import { classed } from '~/util/classed'
import { bytesToGiB, bytesToTiB } from '~/util/units'

const Unit = classed.span`ml-1 text-tertiary`

export function SiloQuotasTab() {
  const { silo } = useSiloSelector()

  const { data: quotas } = usePrefetchedApiQuery('siloQuotasView', { path: { silo: silo } })

  return (
    <>
      <Table className="max-w-md">
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeadCell>Resource</Table.HeadCell>
            {/*<Table.HeadCell>Provisioned</Table.HeadCell>*/}
            <Table.HeadCell>Quota</Table.HeadCell>
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>CPU</Table.Cell>
            <Table.Cell>
              {quotas.cpus} <Unit>vCPUs</Unit>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Memory</Table.Cell>
            <Table.Cell>
              {bytesToGiB(quotas.memory)} <Unit>GiB</Unit>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Storage</Table.Cell>
            <Table.Cell>
              {bytesToTiB(quotas.storage)} <Unit>TiB</Unit>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </>
  )
}
