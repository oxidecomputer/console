import { useMemo } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import type { Silo } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
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
  await apiQueryClient.prefetchQuery('siloListV1', { query: { limit: 10 } })
  return null
}

export default function SilosPage() {
  const navigate = useNavigate()

  const { Table, Column } = useQueryTable('siloListV1', {})
  const queryClient = useApiQueryClient()

  const { data: silos } = useApiQuery('siloListV1', {
    query: { limit: 10 },
  })

  const deleteSilo = useApiMutation('siloDeleteV1', {
    onSuccess() {
      queryClient.invalidateQueries('siloListV1', {})
    },
  })

  const makeActions = (silo: Silo): MenuAction[] => [
    {
      label: 'Delete',
      onActivate() {
        deleteSilo.mutate({ path: { silo: silo.name } })
      },
    },
  ]

  useQuickActions(
    useMemo(
      () => [
        { value: 'New silo', onSelect: () => navigate(pb.siloNew()) },
        ...(silos?.items || []).map((o) => ({
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
