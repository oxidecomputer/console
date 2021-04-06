import React from 'react'
import { render } from '../../test-utils'

import { Dropdown } from './Dropdown'

describe('Dropdown', () => {
  it('should render successfully', () => {
    const { container } = render(<Dropdown />)
    expect(container).toBeTruthy()
  })
})
