import type { LoaderFunctionArgs } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { DateCell, DefaultCell, TruncateCell, linkCell, useQueryTable } from '@oxide/table'
import {
  Badge,
  Checkmark12Icon,
  Cloud16Icon,
  Cloud24Icon,
  EmptyMessage,
  PageHeader,
  PageTitle,
  PropertiesTable,
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

function Checkmark({ value }: { value: boolean }) {
  return value ? (
    <Checkmark12Icon className="text-accent" />
  ) : (
    <span className="sr-only">No</span>
  )
}

export function SiloPage() {
  const siloSelector = useSiloSelector()

  const { data: silo } = useApiQuery('siloView', { path: siloSelector })
  invariant(silo, 'silo must be prefetched in loader')

  const siloAdminsHaveFleetAdmin = silo.mappedFleetRoles['admin']?.includes('admin')
  const siloViewersHaveFleetViewer = silo.mappedFleetRoles['viewer']?.includes('viewer')

  const { Table, Column } = useQueryTable('siloIdentityProviderList', {
    query: siloSelector,
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Cloud24Icon />}>{silo.name}</PageTitle>
      </PageHeader>
      <PropertiesTable.Group className="mb-16 -mt-8">
        <PropertiesTable>
          <PropertiesTable.Row label="Grant fleet admin role to silo admins">
            <Checkmark value={siloAdminsHaveFleetAdmin} />
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Grant fleet viewer role to silo viewers">
            <Checkmark value={siloViewersHaveFleetViewer} />
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>
      <h2 className="mb-4 text-mono-sm text-secondary">Identity providers</h2>
      <TableActions>
        <Link to={pb.siloIdpNew(siloSelector)} className={buttonStyle({ size: 'sm' })}>
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
              linkCell((provider) => pb.samlIdp({ ...siloSelector, provider }))({
                value: name,
              })
            ) : (
              <DefaultCell value={name} />
            )
          }
        />
        <Column
          accessor="description"
          cell={(props) => <TruncateCell {...props} maxLength={48} />}
        />
        <Column
          accessor="providerType"
          header="Type"
          cell={({ value }) => <Badge color="neutral">{value}</Badge>}
        />
        <Column accessor="timeCreated" id="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
