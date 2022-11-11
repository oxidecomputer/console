import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { useQueryTable } from '@oxide/table'
import { Badge, Cloud16Icon, EmptyMessage, PageHeader, PageTitle } from '@oxide/ui'

import { requireSiloParams, useSiloParams } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage icon={<Cloud16Icon />} title="No identity providers" />
)

SiloPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await Promise.all([
    apiQueryClient.prefetchQuery('siloView', { path: requireSiloParams(params) }),
    apiQueryClient.prefetchQuery('siloIdentityProviderList', {
      path: requireSiloParams(params),
    }),
  ])
}

export function SiloPage() {
  const { siloName } = useSiloParams()

  const { Table, Column } = useQueryTable('siloIdentityProviderList', {
    path: { siloName },
  })

  return (
    <>
      <PageHeader>
        <PageTitle /*icon={icon}*/>{siloName}</PageTitle>
      </PageHeader>
      <h2 className="mb-4 text-sans-light-2xl">Identity providers</h2>
      <Table emptyState={<EmptyState />}>
        <Column accessor="id" />
        <Column accessor="name" />
        <Column
          accessor="providerType"
          header="Type"
          cell={({ value }) => <Badge color="neutral">{value}</Badge>}
        />
      </Table>
    </>
  )
}
