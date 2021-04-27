import React from 'react'
import { render } from '../../test-utils'

import { Toast } from './Toast'

describe('Toast', () => {
  it('should render successfully', () => {
    const { container } = render(<Toast title="Test" onClose={jest.fn()} />)
    expect(container).toBeTruthy()
  })
})
