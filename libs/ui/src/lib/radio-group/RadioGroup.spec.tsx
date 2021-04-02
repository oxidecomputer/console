import React from 'react'
import { render } from '../../test-utils'

import { RadioGroup } from './RadioGroup'

describe('RadioGroup', () => {
  it('should render successfully', () => {
    const { container } = render(<RadioGroup />)
    expect(container).toBeTruthy()
  })
})
