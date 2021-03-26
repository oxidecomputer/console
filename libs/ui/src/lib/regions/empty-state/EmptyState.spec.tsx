import React from 'react'
import { render } from '../../../test-utils'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('should render successfully', () => {
    const { container } = render(<EmptyState />)
    expect(container).toBeTruthy()
  })
})
