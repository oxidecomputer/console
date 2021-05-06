import React from 'react'
import { Table } from '../Table'

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
          <span>Running</span>
          <span>4d 6h</span>
        </>
      ),
      created: (
        <>
          <span>Yesterday</span>
          <span>2:30 PM</span>
        </>
      ),
    }
  }
  return {
    name: `Web ${index}`,
    status: (
      <>
        <span>Running</span>
        <span>3 minutes ago</span>
      </>
    ),
    created: (
      <>
        <span>Yesterday</span>
        <span>11:30 PM</span>
      </>
    ),
  }
})

const getItemSize = (index: number) => {
  if (index === 0) {
    return 45
  }
  return 64
}

export const Default = () => {
  return (
    <div style={{ height: '50vh' }}>
      <Table columns={sampleColumns} data={sampleData} itemSize={getItemSize} />
    </div>
  )
}

export const DefaultWithControls = () => {
  return (
    <div style={{ height: '50vh' }}>
      <Table
        columns={sampleColumns}
        data={sampleData}
        itemSize={getItemSize}
        showControls
      />
    </div>
  )
}

export const SingleRow = () => {
  return (
    <div style={{ height: '109px' }}>
      <Table
        columns={sampleColumns}
        data={[
          {
            name: `Single Row`,
            status: (
              <>
                <span>Running</span>
                <span>4d 6h</span>
              </>
            ),
            created: (
              <>
                <span>Yesterday</span>
                <span>2:30 PM</span>
              </>
            ),
          },
        ]}
        itemSize={getItemSize}
      />
    </div>
  )
}

export const SingleRowWithControls = () => {
  return (
    <div style={{ height: '165px' }}>
      <Table
        columns={sampleColumns}
        data={[
          {
            name: `Single Row`,
            status: (
              <>
                <span>Running</span>
                <span>4d 6h</span>
              </>
            ),
            created: (
              <>
                <span>Yesterday</span>
                <span>2:30 PM</span>
              </>
            ),
          },
        ]}
        itemSize={getItemSize}
        showControls
      />
    </div>
  )
}
