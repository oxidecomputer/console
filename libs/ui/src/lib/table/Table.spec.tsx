import React from 'react'
import { render } from '@testing-library/react'

import Table from './Table'

describe('Table', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Table
        columns={[{ Header: 'First Name', accessor: 'firstname' }]}
        data={[
          { firstname: 'Cameron' },
          { firstname: 'Haley' },
          { firstname: 'Gordon' },
        ]}
      />
    )
    expect(baseElement).toBeTruthy()
  })
})
