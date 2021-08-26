import React from 'react'
import { useParams } from 'react-router'
import { useTable } from 'react-table'

import { useApiQuery } from '@oxide/api'
import { Table } from '@oxide/ui'

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
  const { projectName } = useParams()
  const { data } = useApiQuery('projectDisksGet', { projectName })

  const disks = data?.items || []

  const table = useTable({ columns, data: disks })

  if (!data) return <div>loading</div>

  return (
    <>
      <h1 className="text-display-2xl my-8">Disks</h1>
      <Table table={table} rowClassName="!h-10" />
    </>
  )
}
