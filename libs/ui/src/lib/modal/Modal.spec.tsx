import React from 'react'
import { render } from '../../test-utils'

import { Modal } from './Modal'

describe('Modal', () => {
  it('should render successfully', () => {
    const { container } = render(<Modal />)
    expect(container).toBeTruthy()
  })
})
