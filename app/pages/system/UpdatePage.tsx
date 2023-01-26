import { Outlet } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import {
  Badge,
  EmptyMessage,
  PageHeader,
  PageTitle,
  PropertiesTable,
  SoftwareUpdate16Icon,
} from '@oxide/ui'

import { RouteTabs, Tab } from 'app/components/RouteTabs'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage icon={<SoftwareUpdate16Icon />} title="No updates available" />
)

UpdatePageUpdates.loader = async () => {
  await apiQueryClient.prefetchQuery('systemUpdateList', { query: { limit: 10 } })
  return null
}

export function UpdatePageUpdates() {
  const { Table, Column } = useQueryTable('systemUpdateList', {})

  return (
    <>
      <Outlet />
      <Table emptyState={<EmptyState />}>
        <Column
          accessor="version"
          cell={linkCell((version) => pb.systemUpdateDetail({ version }))}
        />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}

export function UpdatePageComponents() {
  return null
}

UpdatePageHistory.loader = async () => {
  await apiQueryClient.prefetchQuery('updateDeploymentsList', {
    query: { limit: 10 },
  })
  return null
}

export function UpdatePageHistory() {
  return null
}

UpdatePage.loader = async () => {
  await apiQueryClient.prefetchQuery('systemVersion', {}) // not used yet
  return null
}

export function UpdatePage() {
  const version = useApiQuery('systemVersion', {}).data
  invariant(version, 'System version must be prefetched')

  const { low, high } = version.versionRange

  return (
    <>
      <PageHeader>
        <PageTitle icon={<SoftwareUpdate16Icon />}>System Update</PageTitle>
      </PageHeader>
      {/* <TableActions>
        <Link to={pb.siloIdpNew({ siloName })} className={buttonStyle({ size: 'sm' })}>
          New provider
        </Link>
      </TableActions> */}

      <PropertiesTable className="mb-8">
        <PropertiesTable.Row label="status">
          {version.status.status === 'steady' ? (
            <Badge color="neutral">Steady</Badge>
          ) : (
            <Badge color="notice">Updating</Badge>
          )}
        </PropertiesTable.Row>
        {/* TODO: ? icone with tooltip explaining why version is a range */}
        <PropertiesTable.Row label="version">
          <span className="text-secondary">{low === high ? low : low + '—' + high}</span>
        </PropertiesTable.Row>
        {/* <PropertiesTable.Row label="last updated">
          <span className="text-secondary">{new Date().toISOString()}</span>
        </PropertiesTable.Row> */}
      </PropertiesTable>

      <RouteTabs fullWidth>
        <Tab to={pb.systemUpdates()}>Updates</Tab>
        <Tab to={pb.updateableComponents()}>Components</Tab>
        <Tab to={pb.systemUpdateHistory()}>History</Tab>
      </RouteTabs>
    </>
  )
}
