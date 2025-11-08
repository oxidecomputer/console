/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'

import { api, getListQFn, queryClient, type Sled } from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'

import { makeLinkCell } from '~/table/cells/LinkCell'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

import { ProvisionPolicyBadge, SledKindBadge, SledStateBadge } from './sled/SledBadges'

const sledList = getListQFn(api.methods.sledList, {})

export async function clientLoader() {
  await queryClient.fetchQuery(sledList.optionsFn())
  return null
}

export const handle = { crumb: 'Sleds' }

const colHelper = createColumnHelper<Sled>()
const staticCols = [
  colHelper.accessor('id', {
    cell: makeLinkCell((sledId) => pb.sledInstances({ sledId })),
  }),
  // TODO: colHelper.accessor('baseboard.serviceAddress', { header: 'service address' }),
  colHelper.group({
    id: 'baseboard',
    header: 'Baseboard',
    columns: [
      colHelper.accessor('baseboard.part', { header: 'part number' }),
      colHelper.accessor('baseboard.serial', { header: 'serial number' }),
      colHelper.accessor('baseboard.revision', { header: 'revision' }),
    ],
  }),
  colHelper.group({
    id: 'policy',
    header: 'Policy',
    columns: [
      colHelper.accessor('policy', {
        header: 'Kind',
        cell: (info) => <SledKindBadge policy={info.getValue()} />,
      }),
      colHelper.accessor('policy', {
        header: 'Provision policy',
        cell: (info) => <ProvisionPolicyBadge policy={info.getValue()} />,
      }),
    ],
  }),
  colHelper.accessor('state', {
    cell: (info) => <SledStateBadge state={info.getValue()} />,
  }),
]

export default function SledsTab() {
  const emptyState = <EmptyMessage icon={<Servers24Icon />} title="No sleds found" />
  const { table } = useQueryTable({ query: sledList, columns: staticCols, emptyState })
  return table
}
