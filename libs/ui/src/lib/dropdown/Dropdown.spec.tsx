import React from 'react'
import { render } from '../../test-utils'

import { Dropdown } from './Dropdown'

describe('Dropdown', () => {
  it('should render successfully', () => {
    const { container } = render(
      <Dropdown
        label="Dropdown Menu"
        options={[
          { value: 'de', label: 'Devon Edwards' },
          { value: 'rm', label: 'Randall Miles' },
          { value: 'cj', label: 'Connie Jones' },
          { value: 'eb', label: 'Esther Black' },
          { value: 'sf', label: 'Shane Flores' },
          { value: 'dh', label: 'Darrell Howard' },
          { value: 'jp', label: 'Jacob Pena' },
          { value: 'nm', label: 'Nathan Mckinney' },
          { value: 'br', label: 'Bessie Robertson' },
        ]}
      />
    )
    expect(container).toBeTruthy()
  })
})
