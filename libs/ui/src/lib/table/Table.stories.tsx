import React from 'react'
import { Table, TableProps } from './Table'

export default {
  component: Table,
  title: 'Components/Table',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: TableProps = {}

  return (
    <div style={{ height: '50vh' }}>
      <Table />
    </div>
  )
}
