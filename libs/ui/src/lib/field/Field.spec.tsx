import React from 'react'
import { render } from '@testing-library/react'

import Field from './Field'

describe('Field', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Field />)
    expect(baseElement).toBeTruthy()
  })
})
