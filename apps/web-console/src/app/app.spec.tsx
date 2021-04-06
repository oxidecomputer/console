import React from 'react'
import { render } from '../test-utils'

import App from './app'

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />)
    expect(baseElement).toBeTruthy()
  })
})
