import React from 'react'
import { Table, TableProps } from './Table'

export default {
  component: Table,
  title: 'Components/Table',
}

const sampleData = new Array(1000).fill('').map((value, index) => {
  if (index === 0 || index === 1) {
    return {
      id: index,
      rowData: [
        { colData: `Sticky Row ${index} A` },
        { colData: `Sticky Row ${index} B` },
        { colData: `Sticky Row ${index} C` },
      ],
    }
  } else {
    return {
      id: index,
      rowData: [
        { colData: `Row ${index} A` },
        { colData: `Row ${index} B` },
        { colData: `Row ${index} C` },
      ],
    }
  }
})

export const primary = () => {
  return (
    <div style={{ height: '50vh' }}>
      <Table data={sampleData} />
    </div>
  )
}
