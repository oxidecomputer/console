import React from 'react'
import { selectCol, Table } from '@oxide/ui'
import type { VpcSubnet } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { useParams } from '../../../../hooks'
import type { Column } from 'react-table'
import { useRowSelect } from 'react-table'
import { useTable } from 'react-table'
import { format } from 'date-fns'

const columns: Column<VpcSubnet>[] = [
  {
    accessor: (vpc) => vpc.identity.name,
    id: 'name',
    Header: () => <div className="text-left mx-4">Name</div>,
    Cell: ({ value }: { value: string }) => <div className="mx-4">{value}</div>,
  },
  {
    accessor: (vpc) => [vpc.ipv4Block, vpc.ipv6Block],
    id: 'ip-block',
    Header: () => <div className="text-left mx-4">IP Block</div>,
    Cell: ({ value }: { value: [string, string] }) => (
      <>
        <div className="mx-4">{value[0]}</div>
        <div className="mx-4 text-gray-200">{value[1]}</div>
      </>
    ),
  },
  {
    accessor: (vpc) => vpc.identity.timeCreated,
    id: 'created',
    Header: () => <div className="text-left mx-4">Created</div>,
    Cell: ({ value }: { value: Date }) => (
      <>
        <div className="mx-4">{format(value, 'MMM d, yyyy')}</div>
        <div className="mx-4 text-gray-200">{format(value, 'p')}</div>
      </>
    ),
  },
]

export const VpcSubnetsTab = () => {
  const { orgName, projectName, vpcName } = useParams(
    'orgName',
    'projectName',
    'vpcName'
  )
  const { data } = useApiQuery('vpcSubnetsGet', {
    organizationName: orgName,
    projectName,
    vpcName,
  })

  const table = useTable(
    { columns, data: data?.items || [] },
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [selectCol, ...columns])
    }
  )

  if (!data) return <div>loading</div>

  return <Table table={table} />
}
