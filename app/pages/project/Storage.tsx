import React from 'react'
import { useTable } from 'react-table'

import { useApiQuery } from '@oxide/api'
import { Table } from '@oxide/ui'
import { useParams } from '../../hooks'

const columns = [
  {
    accessor: 'name' as const,
    Header: () => <div className="text-left mx-4">Name</div>,
    Cell: ({ value }: { value: string }) => <div className="mx-4">{value}</div>,
  },
  {
    accessor: 'description' as const,
    Header: 'Description',
    className: 'text-left',
  },
]

export default function ProjectStorage() {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  const { data } = useApiQuery(
    'projectDisksGet',
    { organizationName: orgName, projectName },
    { refetchInterval: 5000 }
  )

  const disks = data?.items || []

  const table = useTable({ columns, data: disks })

  if (!data) return null

  return (
    <>
      <h1 className="text-display-2xl my-8">Disks</h1>
      <Table table={table} rowClassName="!h-10" />
    </>
  )
}
