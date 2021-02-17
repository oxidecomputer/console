import React from 'react'
import { render } from '@testing-library/react'

import Theme from './Theme'

describe('Theme', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Theme />)
    expect(baseElement).toBeTruthy()
  })
})
