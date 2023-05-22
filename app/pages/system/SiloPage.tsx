import type { LoaderFunctionArgs } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { DateCell, DefaultCell, TruncateCell, linkCell, useQueryTable } from '@oxide/table'
import {
  Badge,
  Cloud16Icon,
  EmptyMessage,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { getSiloSelector, useSiloSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage icon={<Cloud16Icon />} title="No identity providers" />
)

SiloPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { silo } = getSiloSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('siloView', { path: { silo } }),
    apiQueryClient.prefetchQuery('siloIdentityProviderList', {
      query: { silo, limit: 10 }, // same as query table
    }),
  ])
  return null
}

export function SiloPage() {
  const { silo } = useSiloSelector()

  const { Table, Column } = useQueryTable('siloIdentityProviderList', {
    query: { silo },
  })

  return (
    <>
      <PageHeader>
        <PageTitle /*icon={icon}*/>{silo}</PageTitle>
      </PageHeader>
      <h2 className="mb-2 text-sans-2xl">Identity providers</h2>
      <TableActions>
        <Link to={pb.siloIdpNew({ silo })} className={buttonStyle({ size: 'sm' })}>
          New provider
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        {/* TODO: this link will only really work for saml IdPs. */}
        <Column
          id="name"
          accessor={({ name, providerType }) => ({ name, providerType })}
          cell={({ value: { name, providerType } }) =>
            // Only SAML IdPs have a detail view API endpoint, so only SAML IdPs
            // get a link to the detail view. This is a little awkward to do with
            // linkCell as currently designed — probably worth a small rework
            providerType === 'saml' ? (
              linkCell((provider) => pb.samlIdp({ silo, provider }))({ value: name })
            ) : (
              <DefaultCell value={name} />
            )
          }
        />
        <Column accessor="description" cell={TruncateCell} />
        <Column
          accessor="providerType"
          header="Type"
          cell={({ value }) => <Badge color="neutral">{value}</Badge>}
        />
        <Column accessor="timeCreated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
