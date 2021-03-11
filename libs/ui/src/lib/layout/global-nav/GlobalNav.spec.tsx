import React from 'react'
import { render } from '../../../test-utils'

import { GlobalNav } from './GlobalNav'

describe('GlobalNav', () => {
  it('should render successfully', () => {
    const { container } = render(<GlobalNav />)
    expect(container).toBeTruthy()
  })
})
