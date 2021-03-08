import React from 'react'
import { Table, TableProps } from './Table'

export default {
  component: Table,
  title: 'Components/Table',
}

const sampleColumns = [
  { Header: 'name', accessor: 'name' },
  { Header: 'Status', accessor: 'status' },
  { Header: 'Created', accessor: 'created' },
]

const sampleData = new Array(1000).fill('').map((value, index) => {
  if (index % 2) {
    return {
      name: `Web ${index}`,
      status: (
        <>
          <div>Running</div>
          <div>4d 6h</div>
        </>
      ),
      created: (
        <>
          <div>Yesterday</div>
          <div>2:30 PM</div>
        </>
      ),
    }
  }
  return {
    name: `Web ${index}`,
    status: (
      <>
        <div>Running</div> <div>3 minutes ago</div>
      </>
    ),
    created: (
      <>
        <div>Yesterday</div>
        <div>11:30 PM</div>
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
