import React from 'react'
import { Table } from './Table'
import { Text } from '../text/Text'

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
          <Text font="mono">Running</Text>
          <Text font="mono" size="sm">
            4d 6h
          </Text>
        </>
      ),
      created: (
        <>
          <Text font="mono">Yesterday</Text>
          <Text font="mono" size="sm">
            2:30 PM
          </Text>
        </>
      ),
    }
  }
  return {
    name: `Web ${index}`,
    status: (
      <>
        <Text font="mono">Running</Text>
        <Text font="mono" size="sm">
          3 minutes ago
        </Text>
      </>
    ),
    created: (
      <>
        <Text font="mono">Yesterday</Text>
        <Text font="mono" size="sm">
          11:30 PM
        </Text>
      </>
    ),
  }
})

const getItemSize = (index) => {
  if (index === 0) {
    return 45
  }
  return 64
}

export const primary = () => {
  return (
    <div style={{ height: '50vh' }}>
      <Table columns={sampleColumns} data={sampleData} itemSize={getItemSize} />
    </div>
  )
}
