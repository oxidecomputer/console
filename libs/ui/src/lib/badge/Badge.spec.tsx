import React from 'react'
import { render } from '../../test-utils'

import { Badge } from './Badge'

describe('Badge', () => {
  it('should render successfully', () => {
    const { container } = render(<Badge title="Test" />)
    expect(container).toBeTruthy()
  })
})
