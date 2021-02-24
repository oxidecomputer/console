import React from 'react'
import { render } from '../../test-utils'

import Layout from './Layout'

describe('Layout', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Layout />)
    expect(baseElement).toBeTruthy()
  })
})
