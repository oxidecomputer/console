import React from 'react'
import { render } from '../../test-utils'

import { InstanceDetails } from './InstanceDetails'

describe('InstanceDetails', () => {
  it('should render successfully', () => {
    const { container } = render(<InstanceDetails />)
    expect(container).toBeTruthy()
  })
})
