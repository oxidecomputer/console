import React from 'react'
import { render } from '../../test-utils'

import Button from './Button'

describe('Button', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Button />)
    expect(baseElement).toBeTruthy()
  })
})
