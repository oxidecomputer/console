/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback, useMemo } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type Silo,
} from '@oxide/api'
import { Cloud24Icon } from '@oxide/design-system/icons/react'

import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { BooleanCell } from '~/table/cells/BooleanCell'
import { DateCell } from '~/table/cells/DateCell'
import { linkCell } from '~/table/cells/LinkCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Cloud24Icon />}
    title="No silos"
    body="You need to create a silo to be able to see it here"
    buttonText="New silo"
    buttonTo={pb.silosNew()}
  />
)

SilosPage.loader = async () => {
  await apiQueryClient.prefetchQuery('siloList', { query: { limit: 25 } })
  return null
}

export function SilosPage() {
  const navigate = useNavigate()

  const { Table, Column } = useQueryTable('siloList', {})
  const queryClient = useApiQueryClient()

  const { data: silos } = usePrefetchedApiQuery('siloList', {
    query: { limit: 25 },
  })

  const deleteSilo = useApiMutation('siloDelete', {
    onSuccess() {
      queryClient.invalidateQueries('siloList')
    },
  })

  const makeActions = useCallback(
    (silo: Silo): MenuAction[] => [
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteSilo.mutateAsync({ path: { silo: silo.name } }),
          label: silo.name,
        }),
      },
    ],
    [deleteSilo]
  )

  useQuickActions(
    useMemo(
      () => [
        { value: 'New silo', onSelect: () => navigate(pb.silosNew()) },
        ...silos.items.map((o) => ({
          value: o.name,
          onSelect: () => navigate(pb.silo({ silo: o.name })),
          navGroup: 'Silo detail',
        })),
      ],
      [navigate, silos]
    )
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Cloud24Icon />}>Silos</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.silosNew()} className={buttonStyle({ size: 'sm' })}>
          New silo
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((silo) => pb.silo({ silo }))} />
        <Column accessor="description" />
        <Column accessor="discoverable" cell={BooleanCell} />
        <Column
          id="Identity mode"
          accessor={(silo) => silo.identityMode}
          cell={({ value }) => <Badge>{value.replace('_', ' ')}</Badge>}
        />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
