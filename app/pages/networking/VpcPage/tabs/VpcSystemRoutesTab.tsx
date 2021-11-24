import React from 'react'
import type { RouteDestination, RouterRoute, RouteTarget } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { useParams } from '../../../../hooks'
import type { Column } from 'react-table'
import { useRowSelect, useTable } from 'react-table'
import { Badge, selectCol, Table } from '@oxide/ui'

const columns: Column<RouterRoute>[] = [
  {
    accessor: (vpc) => vpc.identity.name,
    id: 'name',
    Header: () => <div className="text-left mx-4">Name</div>,
    Cell: ({ value }: { value: string }) => <div className="mx-4">{value}</div>,
  },
  {
    accessor: 'destination',
    id: 'destination',
    Header: () => <div className="text-left mx-4">Destination</div>,
    Cell: ({ value: { type, value } }: { value: RouteDestination }) => (
      <div className="mx-4 space-x-0.5">
        <Badge color="green" variant="dim">
          {type}
        </Badge>
        <Badge color="green" variant="solid">
          {value}
        </Badge>
      </div>
    ),
  },
  {
    accessor: 'target',
    id: 'target',
    Header: () => <div className="text-left mx-4">Target</div>,
    Cell: ({ value: { type, value } }: { value: RouteTarget }) => (
      <div className="mx-4 space-x-0.5">
        <Badge color="green" variant="dim">
          {type}
        </Badge>
        <Badge color="green" variant="solid">
          {value}
        </Badge>
      </div>
    ),
  },
  {
    accessor: (vpc) => vpc.identity.description,
    id: 'description',
    Header: () => <div className="text-left mx-4">Description</div>,
    Cell: ({ value }: { value: string }) => <div className="mx-4">{value}</div>,
  },
]

export const VpcSystemRoutesTab = () => {
  const { orgName, projectName, vpcName } = useParams(
    'orgName',
    'projectName',
    'vpcName'
  )
  const { data } = useApiQuery('routersRoutesGet', {
    organizationName: orgName,
    projectName,
    vpcName,
    routerName: 'system',
  })

  const table = useTable({ columns, data: data?.items || [] })

  if (!data) return <div>loading</div>
  return <Table table={table} />
}
