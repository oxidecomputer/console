import React from 'react'
import { render } from '../../../test-utils'

import GlobalNavigation from './GlobalNavigation'

describe('GlobalNavigation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GlobalNavigation />)
    expect(baseElement).toBeTruthy()
  })
})
