/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import type { Silo } from '@oxide/api'
import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { linkCell } from '@oxide/table'
import { BooleanCell } from '@oxide/table'
import { DateCell } from '@oxide/table'
import { useQueryTable } from '@oxide/table'
import {
  Badge,
  Cloud24Icon,
  EmptyMessage,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { useQuickActions } from 'app/hooks/use-quick-actions'
import { confirmDelete } from 'app/stores/confirm-delete'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Cloud24Icon />}
    title="No silos"
    body="You need to create a silo to be able to see it here"
    buttonText="New silo"
    buttonTo={pb.siloNew()}
  />
)

SilosPage.loader = async () => {
  await apiQueryClient.prefetchQuery('siloList', { query: { limit: 10 } })
  return null
}

export default function SilosPage() {
  const navigate = useNavigate()

  const { Table, Column } = useQueryTable('siloList', {})
  const queryClient = useApiQueryClient()

  const { data: silos } = usePrefetchedApiQuery('siloList', {
    query: { limit: 10 },
  })

  const deleteSilo = useApiMutation('siloDelete', {
    onSuccess() {
      queryClient.invalidateQueries('siloList')
    },
  })

  const makeActions = (silo: Silo): MenuAction[] => [
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () => deleteSilo.mutateAsync({ path: { silo: silo.name } }),
        label: silo.name,
      }),
    },
  ]

  useQuickActions(
    useMemo(
      () => [
        { value: 'New silo', onSelect: () => navigate(pb.siloNew()) },
        ...silos.items.map((o) => ({
          value: o.name,
          onSelect: () => navigate(pb.silo({ silo: o.name })),
          navGroup: 'Go to silo',
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
        <Link to={pb.siloNew()} className={buttonStyle({ size: 'sm' })}>
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
