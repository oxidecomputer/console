/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { getCoreRowModel } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { api, q, queryClient, usePrefetchedQuery } from '~/api'
import { EditQuotasSideModalForm } from '~/forms/silo-quotas-edit'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useSiloSelector } from '~/hooks/use-params'
import { createColumnHelper } from '~/table/column-helper'
import { ColWidth } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { useTable } from '~/table/use-table'
import { Button } from '~/ui/lib/Button'
import { ValueUnit } from '~/ui/lib/ValueUnit'
import type * as PP from '~/util/path-params'
import { bytesToGiB } from '~/util/units'

import type { Route } from './+types/SiloQuotasTab'

const siloUtil = ({ silo }: PP.Silo) => q(api.siloUtilizationView, { path: { silo } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { silo } = params
  await queryClient.prefetchQuery(siloUtil({ silo }))
  return null
}

type QuotaRow = { resource: string; provisioned: number; quota: number; unit: string }

const colHelper = createColumnHelper<QuotaRow>()

const valueCell = (info: { getValue: () => number; row: { original: QuotaRow } }) => (
  <ValueUnit value={info.getValue()} unit={info.row.original.unit} />
)

const columns = [
  colHelper.accessor('resource', { header: 'Resource', meta: { width: ColWidth.md } }),
  colHelper.accessor('provisioned', {
    header: 'Provisioned',
    meta: { width: 'flex' },
    cell: valueCell,
  }),
  colHelper.accessor('quota', {
    header: 'Quota',
    meta: { width: 'flex' },
    cell: valueCell,
  }),
]

export default function SiloQuotasTab() {
  const { silo } = useSiloSelector()
  const { data: utilization } = usePrefetchedQuery(siloUtil({ silo }))

  const { allocated: quotas, provisioned } = utilization

  const [editing, setEditing] = useState(false)

  const rows = useMemo(
    (): QuotaRow[] => [
      { resource: 'CPU', provisioned: provisioned.cpus, quota: quotas.cpus, unit: 'vCPUs' },
      {
        resource: 'Memory',
        provisioned: bytesToGiB(provisioned.memory),
        quota: bytesToGiB(quotas.memory),
        unit: 'GiB',
      },
      {
        resource: 'Storage',
        provisioned: bytesToGiB(provisioned.storage),
        quota: bytesToGiB(quotas.storage),
        unit: 'GiB',
      },
    ],
    [provisioned, quotas]
  )
  const table = useTable({
    id: 'silo-quotas',
    columns,
    data: rows,
    getRowId: (row) => row.resource,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <Table table={table} className="max-w-lg" />
      <div className="mt-4 flex space-x-2">
        <Button size="sm" onClick={() => setEditing(true)}>
          Edit quotas
        </Button>
      </div>
      {editing && (
        <EditQuotasSideModalForm
          silo={silo}
          quotas={quotas}
          provisioned={provisioned}
          onDismiss={() => setEditing(false)}
        />
      )}
    </>
  )
}

export const handle = makeCrumb('Quotas')
