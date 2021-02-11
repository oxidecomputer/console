import React from 'react'
import { render } from '@testing-library/react'

import Navigation from './Navigation'

describe('Navigation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Navigation />)
    expect(baseElement).toBeTruthy()
  })
})
