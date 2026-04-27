/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Outlet, type LoaderFunctionArgs } from 'react-router'

import { Cloud24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { api, getListQFn, queryClient, type IdentityProvider } from '~/api'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSiloSelector, useSiloSelector } from '~/hooks/use-params'
import { LinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage icon={<Cloud24Icon />} title="No identity providers" />
)

const colHelper = createColumnHelper<IdentityProvider>()

export const siloIdpList = (silo: string) =>
  getListQFn(api.siloIdentityProviderList, { query: { silo } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { silo } = getSiloSelector(params)
  await queryClient.prefetchQuery(siloIdpList(silo).optionsFn())
  return null
}

export default function SiloIdpsTab() {
  const { silo } = useSiloSelector()

  const columns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: (info) => {
          const provider = info.getValue()
          if (info.row.original.providerType !== 'saml') return provider
          return <LinkCell to={pb.samlIdp({ silo, provider })}>{provider}</LinkCell>
        },
      }),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('providerType', {
        header: 'Type',
        cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [silo]
  )

  const { table } = useQueryTable({
    query: siloIdpList(silo),
    columns,
    emptyState: <EmptyState />,
  })

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <CreateLink to={pb.siloIdpsNew({ silo })}>New provider</CreateLink>
      </div>
      {table}
      <Outlet />
    </>
  )
}

export const handle = makeCrumb('Identity Providers', (params) =>
  pb.siloIdps(getSiloSelector(params))
)
