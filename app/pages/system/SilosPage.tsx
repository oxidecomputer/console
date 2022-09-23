import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import type { Silo } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
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

import { CreateSiloSideModalForm } from 'app/forms/silo-create'
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
  await apiQueryClient.prefetchQuery('siloList', { limit: 10 })
}

interface SilosPageProps {
  modal?: 'createSilo'
}

export default function SilosPage({ modal }: SilosPageProps) {
  const navigate = useNavigate()

  const { Table, Column } = useQueryTable('siloList', {})
  const queryClient = useApiQueryClient()

  const { data: silos } = useApiQuery('siloList', {
    limit: 10,
  })

  const deleteSilo = useApiMutation('siloDelete', {
    onSuccess() {
      queryClient.invalidateQueries('siloList', {})
    },
  })

  const makeActions = (silo: Silo): MenuAction[] => [
    {
      label: 'Delete',
      onActivate() {
        deleteSilo.mutate({ siloName: silo.name })
      },
    },
  ]

  useQuickActions(
    useMemo(
      () => [
        { value: 'New silo', onSelect: () => navigate(pb.siloNew()) },
        ...(silos?.items || []).map((o) => ({
          value: o.name,
          onSelect: () => navigate(pb.silo({ siloName: o.name })),
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
        <Link to={pb.siloNew()} className={buttonStyle({ variant: 'default', size: 'xs' })}>
          New Silo
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="discoverable" cell={BooleanCell} />
        <Column
          id="User provision type"
          accessor={(silo) => silo.userProvisionType}
          cell={({ value }) => <Badge>{value}</Badge>}
        />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <CreateSiloSideModalForm
        isOpen={modal === 'createSilo'}
        onDismiss={() => navigate(pb.silos())}
      />
    </>
  )
}
