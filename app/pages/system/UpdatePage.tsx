import { useMemo } from 'react'
import { Outlet } from 'react-router-dom'

import type { UpdateDeployment, UpdateableComponentType } from '@oxide/api'
import { apiQueryClient, componentTypeNames, useApiQuery } from '@oxide/api'
import { Pagination } from '@oxide/pagination'
import {
  Table as CustomTable,
  DateCell,
  createColumnHelper,
  linkCell,
  useQueryTable,
  useReactTable,
} from '@oxide/table'
import {
  Badge,
  EmptyMessage,
  PageHeader,
  PageTitle,
  PropertiesTable,
  SoftwareUpdate16Icon,
  Success12Icon,
  TableEmptyBox,
  Unauthorized12Icon,
} from '@oxide/ui'
import { sortBy } from '@oxide/util'

import { RouteTabs, Tab } from 'app/components/RouteTabs'
import { pb2 } from 'app/util/path-builder'

UpdatePageUpdates.loader = async () => {
  await apiQueryClient.prefetchQuery('systemUpdateList', { query: { limit: 10 } })
  return null
}

export function UpdatePageUpdates() {
  const { Table, Column } = useQueryTable('systemUpdateList', {})

  return (
    <>
      <Outlet />
      <Table
        emptyState={
          <EmptyMessage icon={<SoftwareUpdate16Icon />} title="No updates available" />
        }
      >
        <Column
          accessor="version"
          cell={linkCell((version) => pb2.systemUpdateDetail({ version }))}
        />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}

UpdatePageComponents.loader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('systemComponentVersionList', {
      query: { limit: 10 },
    }),
    apiQueryClient.prefetchQuery('updateDeploymentsList', {
      query: { limit: 10 },
    }),
  ])
  return null
}

export function UpdatePageComponents() {
  const { Table, Column } = useQueryTable('systemComponentVersionList', {})
  const latestDeployment = useUpdateDeployments()[0]
  const targetVersion =
    latestDeployment?.status.status === 'updating' ? latestDeployment.version : null

  return (
    <>
      <Outlet />
      <Table
        emptyState={
          <EmptyMessage icon={<SoftwareUpdate16Icon />} title="No components available" />
        }
      >
        <Column
          accessor="componentType"
          header="Type"
          cell={({ value }: { value: UpdateableComponentType }) => (
            <>{componentTypeNames[value]}</>
          )}
        />
        <Column accessor="version" />
        <Column accessor="systemVersion" header="System version" />
        <Column
          accessor="systemVersion"
          header="Status"
          // this is going to need to be a lot more complicated
          cell={({ value }) =>
            targetVersion === value ? (
              <span className="flex items-center text-secondary">
                <Success12Icon className="mr-2 text-accent" /> Updated
              </span>
            ) : (
              <span className="flex items-center text-secondary">
                <Unauthorized12Icon className="mr-2 text-quinary" /> Waiting
              </span>
            )
          }
        />
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

const colHelper = createColumnHelper<UpdateDeployment>()

const columns = [
  colHelper.accessor('version', { header: 'Version' }),
  colHelper.accessor('status.status', {
    header: 'Status',
    cell: (info) =>
      info.getValue() === 'updating' ? (
        <Badge color="notice">Updating</Badge>
      ) : (
        <Badge color="neutral">Complete</Badge>
      ),
  }),
  colHelper.accessor('timeCreated', {
    header: 'Created',
    cell: (info) => <DateCell value={info.getValue()} />,
  }),
  colHelper.accessor('timeModified', {
    header: 'Created',
    cell: (info) => <DateCell value={info.getValue()} />,
  }),
]

// sort client-side as a stopgap because we aren't sorting this list by most
// recent in the API yet
function useUpdateDeployments() {
  const { data } = useApiQuery('updateDeploymentsList', { query: { limit: 10 } })
  return useMemo(() => sortBy(data?.items || [], (d) => d.timeCreated).reverse(), [data])
}

const fakePagParams = {
  pageSize: 10,
  hasNext: false,
  hasPrev: false,
  nextPage: undefined,
  onNext: () => {},
  onPrev: () => {},
}

export function UpdatePageHistory() {
  const updateDeployments = useUpdateDeployments()
  const tableInstance = useReactTable({ columns, data: updateDeployments })

  return (
    <>
      <Outlet />
      {updateDeployments.length > 0 ? (
        <>
          {/* need to use this instead of QueryTable because we need to sort the items client-side */}
          <CustomTable table={tableInstance} />
          {/* fake pagination! */}
          <Pagination {...fakePagParams} />
        </>
      ) : (
        <TableEmptyBox>
          <EmptyMessage icon={<SoftwareUpdate16Icon />} title="No history available" />
        </TableEmptyBox>
      )}
    </>
  )
}

UpdatePage.loader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('systemVersion', {}),
    apiQueryClient.prefetchQuery('updateDeploymentsList', {
      query: { limit: 10 },
    }),
  ])
  return null
}

export function UpdatePage() {
  const { data: version } = useApiQuery('systemVersion', {})
  const latestDeployment = useUpdateDeployments()[0]
  const targetVersion =
    latestDeployment?.status.status === 'updating' ? latestDeployment.version : null
  const status = version?.status.status

  // TODO: turn this back on once we can expect it to work on the API side
  // invariant(version, 'System version must be prefetched')

  // API 500s and `version` is undefined when there are no updateable components
  // in the DB

  let low = 'Unknown'
  let high = 'Unknown'

  if (version) {
    low = version.versionRange.low
    high = version.versionRange.high
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon={<SoftwareUpdate16Icon />}>System Update</PageTitle>
      </PageHeader>

      <PropertiesTable className="mb-8">
        <PropertiesTable.Row label="status">
          {status ? (
            status === 'steady' ? (
              <Badge color="neutral">Steady</Badge>
            ) : (
              <Badge color="notice">Updating</Badge>
            )
          ) : (
            <Badge color="neutral">Unknown</Badge>
          )}
          {targetVersion ? (
            <span className="ml-2 text-secondary">to {targetVersion}</span>
          ) : null}
        </PropertiesTable.Row>
        {/* TODO: ? icon with tooltip explaining why version is a range */}
        <PropertiesTable.Row label="version">
          <span className="text-secondary">{low === high ? low : low + '—' + high}</span>
        </PropertiesTable.Row>
        {/* <PropertiesTable.Row label="last updated">
          <span className="text-secondary">{new Date().toISOString()}</span>
        </PropertiesTable.Row> */}
      </PropertiesTable>

      <RouteTabs fullWidth>
        <Tab to={pb2.systemUpdates()}>Updates</Tab>
        <Tab to={pb2.updateableComponents()}>Components</Tab>
        <Tab to={pb2.systemUpdateHistory()}>History</Tab>
      </RouteTabs>
    </>
  )
}
