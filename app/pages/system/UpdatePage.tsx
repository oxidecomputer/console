import { Outlet } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { UpdateStatus, UpdateableComponentType } from '@oxide/api'
import { apiQueryClient, componentTypeNames, useApiQuery } from '@oxide/api'
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

const StatusBadge = ({ status }: { status: UpdateStatus['status'] }) =>
  status === 'steady' ? (
    <Badge color="neutral">Steady</Badge>
  ) : (
    <Badge color="notice">Updating</Badge>
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

UpdatePageComponents.loader = async () => {
  await apiQueryClient.prefetchQuery('systemComponentVersionList', {
    query: { limit: 10 },
  })
  return null
}

export function UpdatePageComponents() {
  const { Table, Column } = useQueryTable('systemComponentVersionList', {})

  return (
    <>
      <Outlet />
      <Table emptyState={<EmptyState />}>
        <Column
          accessor="componentType"
          header="Type"
          cell={({ value }: { value: UpdateableComponentType }) => (
            <>{componentTypeNames[value]}</>
          )}
        />
        <Column accessor="version" />
        <Column accessor="systemVersion" header="System version" />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}

UpdatePageHistory.loader = async () => {
  await apiQueryClient.prefetchQuery('updateDeploymentsList', {
    query: { limit: 10 },
  })
  return null
}

export function UpdatePageHistory() {
  const { Table, Column } = useQueryTable('updateDeploymentsList', {})

  return (
    <>
      <Outlet />
      <Table emptyState={<EmptyState />}>
        <Column accessor="version" />
        <Column
          accessor="status.status"
          header="Status"
          cell={({ value }) => <StatusBadge status={value} />}
        />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
        <Column accessor="timeModified" header="Updated" cell={DateCell} />
      </Table>
    </>
  )
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
          <StatusBadge status={version.status.status} />
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
