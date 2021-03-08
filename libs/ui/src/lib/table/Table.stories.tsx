import React from 'react'
import { Table, TableProps } from './Table'

export default {
  component: Table,
  title: 'Components/Table',
}

const sampleColumns = [
  { Header: 'name', accessor: 'name' },
  { Header: <div>CPU, Ram / Image</div>, accessor: 'cpu' },
  { Header: 'Status', accessor: 'status' },
]

const sampleData = new Array(1000).fill('').map((value, index) => {
  if (index % 2) {
    return {
      name: `Web ${index}`,
      cpu: '1 vCPU, 4 GB Ram, Debian 9.12 x64',
      status: 'Running 2 months ago',
    }
  }
  return {
    name: `Web ${index}`,
    cpu: '1 vCPU, 4 GB Ram, Debian 9.12 x64',
    status: (
      <>
        <div>Running</div> 3 minutes ago
      </>
    ),
  }
})

export const primary = () => {
  return (
    <div style={{ height: '50vh' }}>
      <Table columns={sampleColumns} data={sampleData} />
    </div>
  )
}
