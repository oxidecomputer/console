import React from 'react'
import { render } from '@testing-library/react'

import GlobalNavigation from './GlobalNavigation'

describe('GlobalNavigation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GlobalNavigation />)
    expect(baseElement).toBeTruthy()
  })
})
