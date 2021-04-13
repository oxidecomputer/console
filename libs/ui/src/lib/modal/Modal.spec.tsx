import React from 'react'
import { render } from '../../test-utils'

import { TwoButtonModal } from './Modal'

describe('Modal', () => {
  it('should render successfully', () => {
    const { container } = render(<TwoButtonModal />)
    expect(container).toBeTruthy()
  })
})
