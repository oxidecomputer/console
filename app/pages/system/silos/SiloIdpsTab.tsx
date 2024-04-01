/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { Link, Outlet } from 'react-router-dom'

import { Cloud24Icon } from '@oxide/design-system/icons/react'

import type { IdentityProvider } from '~/api'
import { useSiloSelector } from '~/hooks'
import { DateCell } from '~/table/cells/DateCell'
import { DefaultCell } from '~/table/cells/DefaultCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { TruncateCell } from '~/table/cells/TruncateCell'
import { useQueryTable } from '~/table/QueryTable2'
import { Badge } from '~/ui/lib/Badge'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage icon={<Cloud24Icon />} title="No identity providers" />
)

export function SiloIdpsTab() {
  const siloSelector = useSiloSelector()

  const { Table } = useQueryTable('siloIdentityProviderList', {
    query: siloSelector,
  })

  const colHelper = createColumnHelper<IdentityProvider>()
  const staticCols = [
    // TODO: this link will only really work for saml IdPs.
    colHelper.accessor((i) => ({ name: i.name, providerType: i.providerType }), {
      header: 'name',
      cell: (info) => {
        const { name, providerType } = info.getValue()
        return providerType === 'saml' ? (
          <LinkCell to={pb.samlIdp({ ...siloSelector, provider: info.getValue().name })}>
            {name}
          </LinkCell>
        ) : (
          <DefaultCell value={name} />
        )
      },
    }),
    colHelper.accessor('description', {
      cell: (info) => <TruncateCell value={info.getValue()} maxLength={48} />,
    }),
    colHelper.accessor('providerType', {
      header: 'Type',
      cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
    }),
    colHelper.accessor('timeCreated', {
      header: 'created',
      cell: (props) => <DateCell value={props.getValue()} />,
    }),
  ]

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Link to={pb.siloIdpsNew(siloSelector)} className={buttonStyle({ size: 'sm' })}>
          New provider
        </Link>
      </div>
      <Table emptyState={<EmptyState />} columns={staticCols} />
      <Outlet />
    </>
  )
}
